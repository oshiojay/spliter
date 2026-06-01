const userModel = require('../model/user')
const cloudinary = require('../middleware/cloudinary')
const fs = require('fs');
const {brevo} = require('../utils/brevo')
const bcryot = require('bcrypt')
const {emailTemplate, resetPasswordTemplate} = require('../email')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const client = require('../utils/redis')


exports.createUser = async(req, res)=>{
    try {

        const {fullname,email,phoneNumber,password}= req.body

        const otp = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})

        const salt = await bcryot.genSalt(10)
        const hashedPassword = await bcryot.hash(password, salt)

        const newUser = new userModel({
            fullname,
            email: email.toLowerCase(),
            phoneNumber,
            password: hashedPassword,
            otp
        })
        brevo(newUser.email, newUser.fullname, emailTemplate(newUser.fullname, newUser.otp))
        await newUser.save()
        
        res.status(201).json({
            message: "User created successfully",
            data: newUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        })
    }
}


exports.updateProfile = async(req, res)=>{
    try {
        const files = req.file;
        console.log(files)
        const filePath = files['path']

        const uploadToCloudinary = await cloudinary.uploader.upload(filePath);
        const extractSecureurl = {secureUrl:uploadToCloudinary.secure_url, publicId: uploadToCloudinary.public_id}
        console.log(`hello: `, extractSecureurl)
        fs.unlinkSync(filePath)


        const {bankName, accountNumber} = req.body
        const {id}= req.params

        console.log('ID:',id);
        
        const user = await userModel.findById(id);
        console.log('user:',user);
        
        const updateUser = await userModel.findByIdAndUpdate(id, 
        {
            bankName,
            accountNumber,
            profilePicture: extractSecureurl
        },
        {
        new: true
        })
        res.status(200).json({
            message: "User profile updated successfully",
            data: updateUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updating user profile",
            error: error.message
        })
    }
}

exports.verifyEmail = async (req, res)=>{
    try {
        const {email, otp}=req.body
        const user = await userModel.findOne({ email: email})
        console.log(user)
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }
        if(Date.now() > user.otpExpire || otp !== user.otp){
            return res.status(400).json({
                message: 'Invalid OTP'
            })
        }
        user.isVerified = true
        await user.save()
        res.status(200).json({
            message: 'OTP Verified successfully',
            data: user
        })
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}
exports.login = async (req, res) => {
    try {

        const {email, password} = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase() })
        if (!user){
            return res.status(404).json({
                message: 'Invalid Credentials'
            })
        }
        
        if (user.isLocked) {
            return res.status(423).json({
                message: 'Account locked'
            })
        }

        const correctPassword = await bcryot.compare(password, user.password)

        if (!correctPassword) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1
            if (user.failedLoginAttempts >= 5){
                user.isLocked = true
                await user.save()
                return res.status(429).json({
                    message: 'Account locked'
                })
            }

            await user.save()

            return res.status(400).json({
                message: 'Invalid Credentials',
                attemptsRemaining: 5 - user.failedLoginAttempts
            })
        }
        if (user.isVerified == false) {
            return res.status(400).json({
                message: 'Please verify your email'
            })
        };

        user.failedLoginAttempts = 0
        await user.save()

        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.SECERT_KEY,
            {expiresIn: '1d'}
        );

        res.status(200).json({
            message: 'Login successfull',
            token,
            user
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: `Something went wrong`
        })
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await userModel.findOne({email: email.toLowerCase()})
        if(user == null){
            return res.status(404).json({
                message: 'Invalid credential'
            })
        }
        const OTP = Math.round(Math.random() * 1e6).toString().padStart(6, "0")

        user.otp = OTP
        console.log(OTP)
        user.otpExpire = Date.now() + (1000 * 60 * 7)
        
        const data = {
            name: user.fullname,
            otp: OTP
        }
        brevo(email, user.fullname, resetPasswordTemplate(data))
        
        await user.save()

        res.status(200).json({
            message: 'Forget password successfull'
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const {otp, password, email} = req.body
        const user = await userModel.findOne({email: email.toLowerCase()})

        if (user == null) {
            return res.status(404).json({
                message: 'Invalid credential'
            })
        }
        if (Date.now() > user.otpExpire || otp !== user.otp){
            return res.status(400).json({
                message: 'Invalid or expired OTP'
            })
        }
        const salt = await bcryot.genSalt(10)
        const hashedPassword = await bcryot.hash(password, salt);

        user.password = hashedPassword
        
        await user.save()

         res.status(200).json({
            message: 'password reset successfull'
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { id } = req.user;

        const { oldPassword, newPassword } = req.body;
        const user = await userModel.findById(id);

        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        const checkPassword = await bcryot.compare(oldPassword, user.password);
        if(!checkPassword){
            return res.status(400).json({
                message: "Old password is invalid"
            })
        }

        const salt = await bcryot.genSalt(10)
        const hashedPassword = await bcryot.hash(newPassword, salt);

        user.password = hashedPassword;

        await user.save()

        res.status(200).json({
            message: "Password changed successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.loginWithGoogle = async (req, res) => {
    try {
        const token = await jwt.sign({
            id: req.user._id,
            role: req.user.role
        }, process.env.SECERT_KEY, {expiresIn: '1d'});

        res.status(200).json({
            message: 'Login successful',
            data: req.user.fullname,
            token
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const checkCache = await client.get('users')
        if(checkCache){
            return res.status(200).json({
                message: "Users retrieved successfully",
                data: checkCache
            })
        }

        //console.log(checkCache)
        const users = await userModel.find()
        await client.set('users', JSON.stringify(users), 'EX', 60)

        res.status(200).json({
            message: "Users retrieved successfully",
            data: users
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}
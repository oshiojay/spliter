const paymentModel = require('../model/payment')
const userModel = require('../model/user')
const groupModel = require('../model/group')
const otpGenerator = require('otp-generator')
const axios = require('axios')

exports.initiatePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const {groupId} = req.params;
        const user = await userModel.findById(userId);
        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const group = await groupModel.findById(groupId);
        if (!group){
            return res.status(404).json({
                message: "Group not found"
            })
        }

        const member = group.members.find((member) => member.toString() === userId);
        if (!member) {
            return res.status(404).json({
                message: "You are not a member of this group"
            })
        }

        const ref = otpGenerator.generate(12, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false});
        const reference = `TCA-Splita-${ref}`

        const paymentData = {
            //amount: parseInt(group.contributionAmount),
            amount: Number(group.contributionAmount),
            currency: 'NGN',
            reference,
            customer: {
                email: user.email,
                name: user.fullname

            },
            redirect_url: 'https://www.google.com/'
        }

        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', paymentData, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        })
        
        const payment = new paymentModel({
            amount: paymentData.amount,
            reference,
            userId,
            groupId,
            groupName: group.groupname
        })

        await payment.save();

        res.status(200).json({
            message: "Payment initiated successfully",
            data: response.data?.data,
            payment
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Error initiating payment"
        })
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;

        const {data} = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`,{
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        })

        const payment = await paymentModel.findOne({ reference })
            if (!payment) {
                return res.status(404).json({
                    message: 'Payment not found'
                })
            }

        if (data?.status === true && data?.data.status === 'success') {
            payment.status = data?.data.status;
            await payment.save();

            return res.status(200).json({
                message: "Payment verified successfully",
                data: data?.data
            })
        } else {
            payment.status = data?.data.status;
            await payment.save();

            return res.status(200).json({
                message: "Payment verification failed",
                data: payment
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Error initiating payment"
        })
    }
}


exports.getAllPaymentsByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        const allPayments = await paymentModel.find({userId}).sort({createdAt: -1})
        res.status(200).json({
            message: "Payments retrieved successfully",
            data: allPayments
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "Error initiating payment"
        })
    }
}
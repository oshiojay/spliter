const paymentModel = require('../model/payment')
const userModel = require('../model/user')
const groupModel = require('../model/group')
const axios = require('axios')


exports.initializePaystackPayment = async (req, res) => {
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
       
        //const reference = `TCA-Splita-${ref}`

        const paymentData = {
            amount: group.contributionAmount * 100,
            currency: 'NGN',
            email: user.email,
            callback_url: 'https://www.google.com/'
        }

        const response = await axios.post('https://api.paystack.co/transaction/initialize', paymentData, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })

        const payment = new paymentModel({
            amount: group.contributionAmount,
            reference: `TCA-Splita-${response.data?.data.reference}`,
            userId,
            groupId,
            groupName: group.groupname
        })
        await payment.save();

        res.status(200).json({
            message: "Payment initialized successfully",
            data: response.data?.data,
            payment

        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Error initializing payment"
        });
    }
}

exports.verifyPaystackPayment = async (req, res) => {
    try {
        const { reference } = req.query;

        const {data} = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,{
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        })

        const payment = await paymentModel.findOne({ reference: `TCA-Splita-${reference}` })
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
            message: "Error verifying payment"
        })
    }
}
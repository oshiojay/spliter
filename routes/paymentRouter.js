const { initiatePayment, verifyPayment, getAllPaymentsByUser } = require('../controller/payment')
const { initializePaystackPayment, verifyPaystackPayment } = require('../controller/paystack')
const { checkLogin } = require('../middleware/auth')

const router = require('express').Router()

router.post('/make-payment/:groupId', checkLogin, initiatePayment)
router.post('/make-paystack-payment/:groupId', checkLogin, initializePaystackPayment)
router.get('/verify-payment', checkLogin, verifyPayment)
router.get('/verify-paystack-payment', checkLogin, verifyPaystackPayment)
router.get('/all-payment', checkLogin, getAllPaymentsByUser)

module.exports = router
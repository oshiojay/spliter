const router = require('express').Router()
const {checkLogin} = require('../middleware/auth')
const {} = require('../controller/groupRequest')

router.patch('/group/:groupId/:memberId', checkLogin, removeMemberFromGroup)


module.exports = router
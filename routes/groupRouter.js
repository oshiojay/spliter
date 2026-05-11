const router = require('express').Router()
const {checkLogin} = require('../middleware/auth')
const { createGroup, getAll, getOne, removeMemberFromGroup } = require('../controller/group')
const { groupValidator } = require('../middleware/validator')

router.post('/', checkLogin, groupValidator, createGroup)

router.get('/', checkLogin, getAll)

router.get('/groups', checkLogin, getOne)

router.patch('/:groupId/:memberId', checkLogin, removeMemberFromGroup)


module.exports = router
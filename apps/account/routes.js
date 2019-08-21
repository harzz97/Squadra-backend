const express = require('express')
router = express.Router()

const controller = require('./controller')

router.post('/login', controller.login)
router.post('/signup', controller.signup)
router.get('/findmembers', controller.findMembers)

module.exports = router
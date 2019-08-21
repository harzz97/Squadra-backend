const express = require('express')
router = express.Router()

const accountRoutes = require('./apps/account/routes')
const messageRoutes = require('./apps/message/routes')
const {requireAuth} = require('./helper')
router.use('/account', accountRoutes)
router.use('/message', requireAuth ,messageRoutes)

module.exports = router
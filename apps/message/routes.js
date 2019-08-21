const express = require('express')
const router = express.Router()
const controller = require('./controller')
// const requireAuth = 
//personal
router.get("/",controller.startConversation)
router.get("/fetch",controller.getMessage)
router.post("/send",controller.sendMessage)
router.get("/getAllConversations",controller.getAllConversations)
//channel
router.post("/create",controller.createChannel)
router.post("/addMember",controller.addMember)

module.exports = router
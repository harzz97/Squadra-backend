require('dotenv').config()
var express = require('express');
var bodyparser = require('body-parser')
var firebase = require('./firebaseInitialize')
var helper = require('./helper')
var PORT = process.env.PORT || 3001
var admin = firebase.initializeFirebaseApp()
let db = admin.firestore();

var app = express()
app.locals.db = db

// Authorize user
app.use(helper.verifyJWT)
app.use(bodyparser.json())

app.use(require('./routes'))

app.listen(PORT,()=>{
    console.log("Started listening on ",PORT)
})

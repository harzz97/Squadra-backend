require('dotenv').config()
var express = require('express');
var bodyparser = require('body-parser')
var firebase = require('./firebaseInitialize')
var helper = require('./helper')
var bcrypt = require('bcrypt')

var PORT = process.env.PORT || 3001
var admin = firebase.initializeFirebaseApp()

let db = admin.firestore();
let membersCollection = db.collection("members")

var app = express()

app.use(bodyparser.json())

app.post("/signup",(req,res)=>{

    var requestBody = req.body
    //verify whether the email id is already present or not 
    //if the email id is not present go ahead and create a new user else discard 

    var user_exists = db.collection("members").where("email",'==',requestBody.email)
    user_exists.get().then(
        (snapshot) => {
            if(!snapshot.empty){
                console.log("User already exists")
                res.json({success:false,message:"Error creating user"})
            }
            else
                {
                    var user = {   
                        email: requestBody.email,
                        password: helper.generateHash(requestBody.password),
                        name: requestBody.name,
                        displayName: requestBody.name,
                        isAdmin : false
                    }
                
                    membersCollection.add(user).then(
                        val => {
                            console.log("User ID: ",val.id)
                            res.json({success:true,message:"User created successfully"})
                        })    
                    //TODO:after successful signup navigate user to dashboard
                }
        }
    )
})

app.post("/login",(req,res)=>{
    var requestBody = req.body
    var user = null
    console.log(req.body)
    var users = db.collection("members").where("email",'==',requestBody.email)
    users.get().then(
        (snapshot) => {
            if(!snapshot.empty){
                snapshot.forEach(document => {
                    user = document.data()
                    console.log(user)
                    var passwordMatch = bcrypt.compareSync(requestBody.password,user.password)
                    if(passwordMatch){
                        //generate jwt token with required fields and pass it to client 
                        var token = helper.generateJWT(user,document.id)
                        res.json({success:true,token})
                    }
                    else 
                        res.json({success:false,message:"Invalid email/password"})
                })
            }
            else
                {
                    console.log("User not present")
                    res.json({success:false,message:"Pls signup to user Squadra"})
                }
        }
    )
})

app.get("/findmembers",(req,res)=>{

    var members =  db.collection("members")
    var users = []
    var searchName  = req.query.name.toLowerCase()
    members.get().then(
        (snapshot) =>{
            snapshot.forEach( doc => {
                var obj = doc.data()
                if(obj.name.toLowerCase().includes(searchName))
                    users.push({
                        user_id : doc.id,
                        username: obj.name
                    })
                console.log("User ID",doc.id)
                console.log("User",obj.name)
            })
            res.json(users)
        }
    )

})

app.get("/message",(req,res)=>{
    
    var requestBody = req.body
    console.log("Request Body",requestBody)
    // var participantTwo = db.collection("members").doc(requestBody.participantTwo)
    var participantTwo = requestBody.participantTwo
    // var participantOne = db.collection("members").doc(requestBody.participantOne)
    var participantOne = requestBody.participantOne
     
    var conversationCollection = db.collection("conversations")
    var conversationID = null
    conversationCollection.where("members","array-contains",participantOne).get().then(
        snapshot => {
            if(!snapshot.empty){
                snapshot.forEach(doc => {
                    var obj = doc.data()
                    if(obj.type == 'personal' && obj.members.includes(participantTwo)){
                        conversationID = doc.id
                        res.json({conversationID : conversationID})
                    }
                })
            }else{

                var converseObj = {
                    members: [
                        participantOne,
                        participantTwo
                    ],
                    type:'personal'
                }
                
                conversationCollection.add(converseObj).then(
                    result => {
                        console.log("New Conversation ID",result.id)
                        res.json({conversationID:result.id})
                    }
                )
                
            }
        }
    )
})

app.get("/getMessages",(req,res)=>{
    
    var requestBody = req.body
    var conversationReference = db.collection("messages")
    var messageList = []
    conversationReference.where("conversation",'==',requestBody.conversationID).get().then(
        snapshot => {
            if(!snapshot.empty){
                for (doc of snapshot.docs){
                    messageList.push(doc.data())
                }
                res.json(messageList)

            }else{
                //TODO:create method to get username
                res.json({
                    message:"This is the very beginning of your direct message with "
                })
            }
        }
    )

})

app.post("/sendMessage",(req,res)=>{

    var requestBody = req.body
    var messagesCollection = db.collection("messages")
    //TODO: send date and time object from client end also author id 
    var message = {
        author : "jBYCCoV9TJPLVj7N5lwi",
        parent: null,
        message: requestBody.message,
        conversation : requestBody.conversation,
        read : false,
        time : new Date().toJSON()
    }
    messagesCollection.add(message).then(
        result => {
            console.log(" Message ID",result.id)
            res.json({message:"ok"})
    })
})

app.listen(PORT,()=>{
    console.log("Started listening on ",PORT)
})

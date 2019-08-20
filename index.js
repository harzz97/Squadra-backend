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
                res.send("Error creating user")
            }
            else
                {
                    var user = {   
                        email: requestBody.email,
                        password: helper.generateHash(requestBody.password),
                        name: requestBody.name,
                        displayName: requestBody.name,
                        is_admin : false
                    }
                
                    membersCollection.add(user).then(
                        val => {
                            console.log("User ID: ",val.id)
                            res.send("User created successfully")
                        })    
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
                    if(passwordMatch)
                        res.json(user)
                    else 
                        res.send("Error")
                })
            }
            else
                {
                    console.log("User not present")
                    res.send("Nope")
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

    // res.send("Found")
})
app.listen(PORT,()=>{
    console.log("Started listening on ",PORT)
})

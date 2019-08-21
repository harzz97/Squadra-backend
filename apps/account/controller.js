var bcrypt = require('bcrypt')
var helper = require('../../helper')

exports.login = (req, res) => {
    let db = res.app.locals.db
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
}

exports.signup = (req, res) => {
    let db = res.app.locals.db
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
                        isAdmin : false,
                        createdAt: new Date()
                    }
                
                    membersCollection.add(user).then(
                        val => {
                            console.log("User ID: ",val.id)
                            res.json({success:true,message:"User created successfully"})
                        })    
                }
        }
    )
}

exports.findMembers = (req, res) => {
    let db = res.app.locals.db
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
}
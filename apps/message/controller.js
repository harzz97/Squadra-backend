const firebaseAdmin = require('firebase-admin')
//get messages
exports.getMessage = (req,res) => {
    let db = res.app.locals.db
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

}
//send message
exports.sendMessage = (req,res)=>{
    let db = res.app.locals.db
    var requestBody = req.body
    var messagesCollection = db.collection("messages")
    //TODO: send date and time object from client end also author id 
    var message = {
        author : "jBYCCoV9TJPLVj7N5lwi",
        parent: null,
        message: requestBody.message,
        conversation : requestBody.conversation,
        read : false,
        time : new Date()
    }
    messagesCollection.add(message).then(
        result => {
            console.log(" Message ID",result.id)
            res.json({message:"ok"})
    })
}

//get all conversations of user
exports.getAllConversations = (req,res)=>{
    let db = res.app.locals.db
    var requestObject = req.body
    console.log("Request Object",requestObject)
    var conversationCollection = db.collection("conversations")
    var conversationList = []
    conversationCollection.where('members','array-contains',requestObject.userID).get().then(
        snapshot => {
            for (doc of snapshot.docs){
                conversationList.push(doc.data())
                console.log(doc.data())
            }
        }
    ).then(result => {
        res.json(conversationList)
    })
}

//start conversation
exports.startConversation = (req,res)=>{
    let db = res.app.locals.db
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
}

//create channel 
exports.createChannel = (req,res)=>{
    console.log('Request', req)
    if(req.user.isAuthenticated) {
        let db = res.app.locals.db
        var requestObject = req.body
        var channel = {
            name : requestObject.name,
            description: requestObject.description ,
            members: requestObject.members,
            type : requestObject.type,
            count:requestObject.members.length
        }
        var conversationCollection = db.collection("conversations")
        conversationCollection.add(channel).then(
            result => {
                console.log("Channel ID",result.id)
                res.json({channelID:result.id})
            })
    } else {
        res.json({success: false, error: 'UNAUTHORIZED'})
    }

}

//add users to channel 
exports.addMember = (req,res)=>{
    let db = res.app.locals.db
    var requestBody = req.body
    var conversationCollection = db.collection("conversations")
    conversationCollection.doc(requestBody.channelID).update({
        members:firebaseAdmin.firestore.FieldValue.arrayUnion.apply(null,requestBody.members)
    }).then(
        result => console.log(result.id)
    )
    res.json({success:true})
}
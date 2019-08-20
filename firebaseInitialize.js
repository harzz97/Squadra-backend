var admin = require("firebase-admin");
var serviceAccount = require("./squadra-messenger.json");

module.exports.initializeFirebaseApp = function(){
    var adminObj = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://squadra-messenger.firebaseio.com"
    });
    return adminObj        
}


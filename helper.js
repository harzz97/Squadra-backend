var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var jwtPassphrase = 'northkorea'
var rounds = 8
module.exports.generateHash = function (password)  {
    
    var salt = bcrypt.genSaltSync(rounds);
    var hash = bcrypt.hashSync(password, salt);
    console.log(hash)    
    return hash
}

module.exports.generateJWT = function(user,id){
    var payload = {
        exp:Math.floor(Date.now() / 1000) + (18000),
        data: {
            userId : id,
            name :user.name,
            email: user.email
        }
    }
    var token = jwt.sign(payload,jwtPassphrase)
    return token 
}

module.exports.verifyJWT = function(token){
    var isValid = jwt.verify(token,jwtPassphrase)
    console.log(isValid)
}
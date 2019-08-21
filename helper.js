var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
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
    var token = jwt.sign(payload,process.env['AUTH-SECRET'])
    return token 
}

module.exports.verifyJWT = function(token){
    var isValid = jwt.verify(token,process.env['AUTH-SECRET'])
    console.log(isValid)
}

exports.requireAuth = function (req,res,next) {
    if(req.user.isAuthenticated)
        return next()
    else
        return res.status(401).json({success:false,message:"Unauthorized"})
}
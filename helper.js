var bcrypt = require('bcrypt')
var rounds = 8
module.exports.generateHash = function (password)  {
    
    var salt = bcrypt.genSaltSync(rounds);
    var hash = bcrypt.hashSync(password, salt);
    console.log(hash)    
    return hash
}

/**
 * helpers for various tasks
 */

 //Dependencies
 var crypto = require('crypto')
 var config = require("./config")

//container for all the helpers
let helpers = {}

//create a sha256 hash
helpers.hash = function (str) {
  if(typeof(str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex')
    return hash
  } else {
    return false
  }
}

//parse a json string to an object in all cases without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str)
    return obj
  } catch(e){
    return {}
  }
}

//create a string of random alphanumeric characters, given a length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false
  if(strLength) {
    //define all the possible characters that could go in a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

    //start the final string
    let str = ''
    for(i = 1;i <= strLength;i++){
      //get a random character from the possible characters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      // append this character to the final string
      str += randomCharacter
    }
    //return the final string
    return str

  } else {
    return false
  }
}




//export the module
module.exports = helpers

/**
 * Request Handlers
 */

//Dependencies
const _data = require("./_data")

//define halders
let handlers = {}

//users
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'put', 'get', 'delete']
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data,callback)
  } else{
    callback(405)
  }
}

//container for the users submethods
handlers._users = {}

//users -post
// Required data:firstName,lastName, phone,password, tosAgreement
// Optional data: none
handlers._users.post = function (data,callback){
  //Check that all required fields are filled out
  let firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.playload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.playload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.playload.phone.trim() : false;
  let password = typeof(data.payload.password) == "string" && data.password.password.trim().length > 0 ? data.playload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement) {
    //make sure that the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // hash the password
      } else {
        //user already exists
        callback(400,{'Error':'User with that phone number already exists'})
      }
    })
  } else {
      callback(400,{'Error':'Missing Required Fields'})

  }
}

//users -get
handlers._users.get = function (data,callback){

}

//users -put
handlers._users.put = function (data,callback){

}

//users -delete
handlers._users.delete = function (data,callback){

}

//ping handlers
handlers.ping = function (data,callback){
  callback(200)
}

//not found handler
handlers.notFound = function(data,callback){
  callback(404)
}

//Export the module
module.exports = handlers

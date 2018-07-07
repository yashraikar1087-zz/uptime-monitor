/**
 * Request Handlers
 */

//Dependencies
const _data = require("./data")
const helpers = require("./helpers")
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
  let firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement) {
    //make sure that the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // hash the password
        var hashedPassword = helpers.hash(password)
        if(hashedPassword){
          //create the user object
          var userObject = {
            'firstName' : firstName,
            'lastName' :lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          }
          //store the user
          _data.create('users',phone,userObject,function(err){
            if (!err){
              callback(200)
            } else {
              console.log(err);
              callback (500,{'Error': 'Could not create the new user'})
            }
          })
        } else {
          callback(500,{'Error': 'Could not has the users password'})
        }
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
//Required data:phone
//Optional data:environmentToExport
handlers._users.get = function (data,callback){
  //check that the phone number  is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
  if (phone){
    //get the token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
    //verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
      if(tokenIsValid){
        //lookup the user
        _data.read('users',phone,function(err,data){
          if(!err && data){
            //remove the hashed password from the user object before returning it the requester
            delete data.hashedPassword
            callback(200, data)
          } else {
            callback(404)
          }
        })
      } else {
          callback(403,{"error":"missing token in header or token is invalid"})
      }
    })
  } else {
    callback(400,{'Error':'Missing Required Field'})
  }
}

//users -put
//Required data : phone
//optional data : firsName, lastName,password(at least one must be specified)
handlers._users.put = function (data,callback){
  //check for the required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false

  //check for the optional Fields
  let firstName = typeof(data.payload.firstName) == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  //error if the phone is invalid
  if(phone) {
    //error if nothing is sent to update
    if(firstName || lastName || password) {

      //get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
      //verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
        if(tokenIsValid){
          //lookup the user
          _data.read('users',phone,function(err,userData){
            if(!err && userData){
              //update the fields necessary
              if(firstName){
                userData.firsName = firstName
              }
              if(lastName){
                userData.lastName = lastName
              }
              if(password){
                userData.hashedPassword = helpers.hash(password)
              }

              //store the new updates
              _data.update('users',phone,userData,function(err){
                if(!err){
                  callback(200)
                } else {
                  console.log(err)
                  callback(500,{'Error': 'Could not update the user'})
                }
              })
            } else{
              callback(400,{'Error': 'The specified user does not exist'})
            }
          })
        } else {
            callback(403,{"error":"missing token in header or token is invalid"})
          }
        })
    } else {
      callback(400,{'Error':'Missing fields to update'})
    }
  } else {
    callback(400,{'error':'missing required field'})
  }
}

//users -delete
// Required field : phone
// @TODO only let authenticated users delete their object . Dont let them delete anyone elses
// @TODO cleanup (delete) any other data files associated with this user
handlers._users.delete = function (data,callback){
  //check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false
  if (phone){
    //get the token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
    //verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
      if(tokenIsValid){
        //lookup the user
        _data.read('users',phone,function(err,data){
          if(!err && data){
            _data.delete('users',phone,function(err){
              if(!err){
                callback(200)
              } else {
                callback(500,{'error':'could not delete specified user'})
              }
            })
          } else {
            callback(400,{"error":"could not find the specified user"})
          }
        })
      } else {
          callback(403,{"error":"missing token in header or token is invalid"})
      }
    })
  } else {
    callback(400,{'Error':'Missing Required Field'})
  }
}

//tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'put', 'get', 'delete']
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data,callback)
  } else{
    callback(405)
  }
}

// Container for all the token methods
handlers._tokens = {}

//tokens -post
// Required data: phone,password
// Optional data : none
handlers._tokens.post = function(data,callback){
  let phone = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false
  let password = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
  if(phone && password){
    //lookup the user who matches that phone number
    _data.read('users',phone,function(err,userData){
      if(!err && userData){
        //Hash the sent password and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password)
        if(hashedPassword == userData.hashedPassword){
          //if valid create a new token with a random name, set expiration date 1 hour in the future
          var tokenId = helpers.createRandomString(20)
          var expires = Date.now() + 1000*60*60
          var tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          }

          //store the token
          _data.create('tokens',tokenId,tokenObject,function(err){
            if(!err){
                callback(200,tokenObject)
            } else {
              callback(500,{'Error':'Could not create the new token'})
            }
          })
        } else {
          callback(400,{'Error' : 'Password did not match the specified user'})
        }
      } else {
        callback(400,{'Error':'Could not find the specified user'})
      }
    })

  } else {
    callback(400,{'Error' :'Missing required field(s)'})
  }
}

//tokens -get
//required data- id
//optional data:none
handlers._tokens.get = function(data,callback){
  //check that the phone number  is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id){
    //lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        callback(200, tokenData)
      } else {
        callback(404)
      }
    })
  } else {
    callback(400,{'Error':'Missing Required Field'})
  }

}

//tokens -put
//required data: id,extend
//Optional data : none
handlers._tokens.put = function(data,callback){
    let id = typeof(data.payload.id) == "string" && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false
    let extend = typeof(data.payload.extend) == "boolean" && data.payload.extend == true ? true : false
    if(id && extend){
      //lookup the token
      _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
          //check to make sure the token isnt already expired
          if(tokenData.expires > Date.now()){
            //set expiration an hour from now
            tokenData.expires =  Date.now() + 1000*60*60

            //store the new updates
            _data.update('tokens',id,tokenData,function(err){
              if(!err){
                callback(200)
              } else{
                callback(500,{"Error":"Could not update the token expiration"})
              }
            })
          } else{
            callback(400,{"Error":"The token has already expired and cannot be extended"})
          }
        } else {
          callback(400,{"Error":"specified token does not exist"})
        }
      })
    } else {
      callback(400,{"Eorror":"missing required fields or fields are invalid"})
    }
}

//tokens -delete
// Required data :id
// Optional data : none
handlers._tokens.delete = function(data,callback){
  //check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
  if (id){
    //lookup the token
    _data.read('tokens',id,function(err,data){
      if(!err && data){
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200)
          } else {
            callback(500,{'error':'could not delete specified token'})
          }
        })
      } else {
        callback(400,{"error":"could not find the specified token"})
      }
    })
  } else {
    callback(400,{'Error':'Missing Required Field'})
  }
}

//verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id,phone,callback){
  //lookup the token
  _data.read('tokens',id,function(err,tokenData){
    if(!err && tokenData){
      //check that the token is for the given user and has not expired
      if(tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}

//checks
handlers.checks = function (data, callback) {
  var acceptableMethods = ['post', 'put', 'get', 'delete']
  if(acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data,callback)
  } else{
    callback(405)
  }
}

//Container for all the checks methods
handlers._checks = {}

//Checks - post
//Required data: protocol,url,method,sucessCode, timeoutSeconds
//Optional Data :none

handlers._checks.post = function(data,callback) {
  
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

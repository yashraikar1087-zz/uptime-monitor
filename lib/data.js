/**
 * Library for storing and editing data
 */
//defined files
const helpers = require('./helpers')

//Dependencies
const fs = require('fs')
const path = require('path')

//container for the module (to be exported)
let lib = {}

//base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/')

//write data to a File
lib.create = function(dir, file, data, callback) {
  //open the file for writing
  fs.open(lib.baseDir+dir+"/"+file+'.json','wx',function(err, fileDescriptor){
    if(!err && fileDescriptor){
      //convert data to a string
        var stringData = JSON.stringify(data)

        //write to file and close it
        fs.writeFile(fileDescriptor, stringData, function(err){
          if(!err){
            fs.close(fileDescriptor,function(err){
              if(!err){
                callback(false)
              } else{
                callback('error closing new file')
              }
            })
          } else {
            callback ('error writing new file')
          }
        })
    } else {
      callback('could not create new file, it may already exist')
    }
  })
}

//read data from a file
lib.read = function(dir, file, callback) {
  fs.readFile(lib.baseDir+dir+"/"+file+".json","utf8",function(err, data){
    if(!err && data) {
      var parsedData = helpers.parseJsonToObject(data)
      callback(false,parsedData)
    } else {
      callback(err,data)
    }
  })
}

//update data inside a file
lib.update = function(dir,file,data,callback){
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
      if(!err && fileDescriptor){
        //convert the data to string
        var stringData = JSON.stringify(data)

        //truncate the file
        fs.truncate(fileDescriptor, function(err){
          if(!err){
            //write to the file and close interval
            fs.writeFile(fileDescriptor, stringData, function(err){
              if(!err){
                fs.close(fileDescriptor,function(err){
                  if(!err){
                    callback(false)
                  } else{
                    callback('err closing file')
                  }
                })
              } else{
                callback('error writing to existing file')
              }
            })
          } else {
              callback('error truncating the file')
          }
        })
      } else {
        console.log('could not open the file for updating, it may not exist yet')
      }
    })
}

//delete the file
lib.delete = function(dir,file,callback){
  fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
    if(!err){
      callback(false)
    } else{
      callback('error deleting file')
    }
  })
}

//export the module
module.exports = lib

/**
 * Primary File for the API
 */

//Dependencies
const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const handlers = require('./lib/handlers')
//used to get payload
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
// const _data = require('./lib/data')

//TEtsing
//@TODO delete this

// _data.delete('test','newFile',function(err){
//   console.log('this was the error ',err)
//
// })
//


//Instantiate http server
const httpServer = http.createServer(function(req,res){
  unifiedServer(req,res)

})

//start the server
httpServer.listen(config.httpPort,function(){

  console.log("the http server is listening on port "+ config.httpPort)
})

var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
}

//instantiate https serrver
const httpsServer = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res)
})


//start the https server
httpsServer.listen(config.httpsPort,function(){
  console.log("the https server is listening on port "+ config.httpsPort)
})

//all the server logic for both the http and https server
 var unifiedServer = function(req,res) {

   //get the url and parse it
   let parsedUrl = url.parse(req.url,true)

   //get the path
   let path = parsedUrl.pathname
   let trimmedPath = path.replace(/^\/+|\/+$/g,'')

   //get the query string as an object
   let queryStringObject = parsedUrl.query

   //get the http method
   let method = req.method.toLowerCase()

   //get the headers as an object
   let headers = req.headers

   //get the payload,if any
   let decoder = new StringDecoder('utf-8')
   let buffer = ""
   //bind on the data event of a string which is predefined in node
   req.on('data',function(data){
     buffer += decoder.write(data)
   })
   req.on('end',function(){
     buffer += decoder.end()

     //choose the handler the request to go to. If not found go to not found handler
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath]: handlers.notFound

   //construct the data object to send to the handler
   let data = {
     'trimmedPath' : trimmedPath,
     'queryStringObject' : queryStringObject,
     'method' : method,
     'headers' : headers,
     'payload' :buffer
   }

   //route the request to the handler specified in the router
   chosenHandler(data,function(statusCode,payload){
     //use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200

      //use the payload called back by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {}

      //convet the payload to a string
      let playloadString = JSON.stringify(payload)

      //return the response
      res.setHeader('Content-Type','application/json')
      res.writeHead(statusCode)
      res.end(playloadString)

      console.log('Returning this response: ',statusCode,playloadString)

   })


     //sent the response
         //res.end("Hello world \n")
     //log the request path
     //console.log('Request received on path: '+trimmedPath+'with method: '+method+' and with these query string parameters ',queryStringObject)
   //  console.log('Request received with this payload: '+buffer)
   })
 }


//define a request router
let router = {
  "ping" : handlers.ping,
  "users" : handlers.users
}

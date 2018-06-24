/**
 * Primary File for the API
 */

//Dependencies
const http = require('http')
const url = require('url')
//used to get payload
const StringDecoder = require('string_decoder').StringDecoder

//The server should respond to all requests with a string
const server = http.createServer(function(req,res){

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



})



//start the server and have it listen on port 3000
server.listen(3000,function(){
  console.log("the server is listening on port 3000 now")
})

//define halders
let handlers = {}

//sample handler
handlers.sample = function(data,callback){
  //callback a http status code, and a payload object
  callback(406,{"name":'sample handler'})
}

//not found handler
handlers.notFound = function(data,callback){
  callback(404)
}

//define a request router
let router = {
  "sample" : handlers.sample
}

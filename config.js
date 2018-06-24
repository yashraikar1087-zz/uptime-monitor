/**
 * create and export configuration variables
 */


//container for all the environments
var environments = {}

// staging (Default) environment
environments.staging = {
  'port' : 3000,
  'envName' : 'staging'
}

//production environment
environments.production = {
  'port' : 5000,
  'envName' : 'production'
}

//determine which environment was passed as a command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

//check currentEnvironment is one of the environments above,if not ,defualt to staging

var environmentToExport = type(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

//export the module
module.exports = environmentToExport

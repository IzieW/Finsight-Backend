const jwt = require("jsonwebtoken")
const config = require("./config")

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path:", request.path)
    console.log("Body:", request.body)
    console.log("---")
    next()
}

const unKnownEndPoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}

const getToken = (request, response, next) => {
    const authorization = request.get("authorization")
    console.log("authorization:", authorization)
    if (authorization && authorization.toLowerCase().startsWith("bearer")){
        request.token= authorization.substring(7)
    }
    next()
}

const getUser = (request, response, next) => {
    if(request.token){
        const decodedToken = jwt.verify(request.token, config.SECRET)
        request.user = {
            username: decodedToken.username, 
            id: decodedToken.id
        }
    }
    next()
}

module.exports = {
    requestLogger,
    unKnownEndPoint,
    getToken,
    getUser
}
const config = require("./utils/config")
const middleware = require("./utils/middleware")
const path = require("path")

const express = require("express")

const app = express()

const appRouter = require("express").Router()

const nodeCron = require("node-cron")
const cors = require("cors")
const mongoose = require("mongoose")
const sendAllowance = require("./tasks/allowance")

const transactionRouter = require("./controllers/transactions")
const userRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")
console.log("connecting to", config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then( () => {
        console.log("connected to MongoDB")
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message)
    })

app.use(cors())
app.use(express.json())
app.use(express.static("build"))


app.use(middleware.requestLogger)
app.use(middleware.getToken)
app.use(middleware.getUser)

app.use("/api/transactions", transactionRouter)
app.use("/api/users", userRouter)
app.use("/api/login", loginRouter)

app.get("*", (request, response, next) => {
    const filePath = path.join(__dirname, "build", "index.html")
    console.log(filePath)
    response.sendFile(filePath)
})

const job = nodeCron.schedule("0 0 * * *", 
                                sendAllowance)


app.use(middleware.unKnownEndPoint)

module.exports = app
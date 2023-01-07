const transactionRouter = require("express").Router()
const Transaction = require("../models/transactions")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const config = require("../utils/config")



transactionRouter.get("/", async (request, response) => {
    const expenses = await Transaction.find({})
                            .populate("user", {
                                username: 1, 
                            })
    response.json(expenses)
})

transactionRouter.post("/", async (request, response) => {
    const body = request.body

    console.log(request.user)

    if (!request.user){
        return response.status(401).json({
            error: "token missing or invalid"
        })
    }

    const user = await User.findById(request.user.id)


    const remainingBalance = Math.round((user.balance+body.amount)*100)/100

    const newTransaction = new Transaction({
        reference: body.reference,
        date: new Date, 
        amount: body.amount,
        balanceRemaining: remainingBalance,
        user: user.id
    })

    const savedTransaction = await newTransaction.save()
    
    user.transactions = user.transactions.concat(newTransaction._id)
    user.balance = remainingBalance
    await user.save()

    response.json(savedTransaction)

})

transactionRouter.delete("/:id", async (request, response) => {
    const transactionToDelete = await Transaction.findById(request.params.id)
    console.log(transactionToDelete)

    if(!request.user || transactionToDelete.user.toString() !== request.user.id.toString()){
        return response.status(400).json({
            error: "Unauthorized Deletion"
        })
    }

    const user = await User.findById(transactionToDelete.user)
    const newBalance = Math.round(
        (user.balance + (transactionToDelete.amount*-1))*100
    )/100

    await Transaction.findByIdAndDelete(request.params.id)
    console.log("content deleted")

    await User.findByIdAndUpdate(user.id, {
        balance: newBalance,
        transactions: user.transactions.filter(n => n.id !== request.params.id)
    })

    console.log("new balance saved")

    response.status(200).end()
})


module.exports = transactionRouter
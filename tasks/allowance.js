const User = require("../models/user")
const Transaction = require("../models/transactions")

const sendAllowance = async () => {

    console.log("starting task")

    const users = await User.find({})

    for(user of users){
        let i = 0 
        console.log(`Executing users ${i} of ${users.length}`)

        const remainingBalance = Math.round((user.balance + user.allowance)*100)/100

        const newTransaction = new Transaction({
            reference: "Daily allowance",
            date: new Date, 
            amount: 10,
            balanceRemaining: remainingBalance, 
            user: user.id
        })

        const savedTransaction = await newTransaction.save()

        user.transactions = user.transactions.concat(newTransaction)
        user.balance = remainingBalance

        await user.save()
    }

    console.log("task completed")
}

module.exports = sendAllowance
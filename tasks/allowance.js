const User = require("../models/user")

const sendAllowance = async () => {

    console.log("starting task")

    const users = await User.find({})

    for(user of users){
        let i = 0 
        console.log(`Executing users ${i} of ${users.length}`)
        await User.findByIdAndUpdate(user.id, {
            balance: Number(user.balance) + Number(user.allowance)
        },
        {new: true})
        i += 1
    }

    console.log("task completed")
}

module.exports = sendAllowance
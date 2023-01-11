const User = require("../models/user");
const config = require("../utils/config");
const Transaction = require("../models/transactions");
const mongoose = require("mongoose");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const sendAllowance = async () => {
  console.log("starting task");

  const users = await User.find({});

  let i = 0;

  for (user of users) {
    console.log(`Executing users ${i} of ${users.length}`);

    const remainingBalance =
      Math.round((user.balance + user.allowance) * 100) / 100;

    const newTransaction = new Transaction({
      reference: "Daily allowance",
      date: new Date(),
      amount: 10,
      balanceRemaining: remainingBalance,
      user: user.id,
    });

    const savedTransaction = await newTransaction.save();

    user.transactions = user.transactions.concat(newTransaction);
    user.balance = remainingBalance;

    await user.save();

    i++;
  }

  console.log("task completed");
  mongoose.connection.close();
  return null;
};

sendAllowance();

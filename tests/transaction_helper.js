const Transaction = require("../models/transactions");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const initialTransactions = [
  {
    reference: "test transaction 1",
    date: new Date(),
    amount: 10,
    balanceRemaining: 10,
  },
  {
    reference: "test transaction 2",
    amount: 20,
    date: new Date(),
    balanceRemainging: 10,
  },
];

const getTransactions = async () => {
  const transactions = await Transaction.find({});
  return transactions.map((i) => i.toJSON());
};

const nonExistingId = async () => {
  const transaction = new Transaction({
    reference: "toDelete",
    amount: 10,
  });

  await transaction.save();
  await transaction.remove();

  return transaction.id.toString();
};

const getToken = async () => {
  const users = await User.find({});

  const user = users[0];

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  token = jwt.sign(userForToken, process.env.SECRET);
  return token;
};

module.exports = {
  initialTransactions,
  getTransactions,
  getToken,
  nonExistingId,
};

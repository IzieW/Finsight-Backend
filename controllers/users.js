const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Transaction = require("../models/transactions")

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("transactions", {
    reference: 1,
    amount: 1,
    date: 1,
    balanceRemaining: 1,
  });
  response.json(users);
});

userRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).populate("transactions", {
    reference: 1,
    amount: 1,
    date: 1,
    balanceRemaining: 1,
  });
  if (!user) {
    return response.status(404).end();
  }
  response.json(user);
});

userRouter.post("/", async (request, response) => {
  const { username, name, password, allowance } = request.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return response.status(400).json({
      error: `the username ${username} already exists`,
    });
  }

  if (!username || !name || !password) {
    return response.status(400).json({
      error: "missing information",
    });
  }

  if(allowance && isNaN(allowance)){
    return response.status(400).json({
      error: "allowance must be a number"
    })
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    username,
    name,
    passwordHash,
    date: new Date(),
    balance: 0,
    allowance
  });

  const savedUser = await newUser.save();

    // Send first allowance
    console.log("dealing with new user!")
  console.log(newUser.id)

  const dailyAllowance = new Transaction({
    reference: "Daily Allowance",
    date: new Date, 
    amount: allowance, 
    balanceRemaining: allowance,
    user: newUser.id
  })

  const savedTransaction = await dailyAllowance.save()
  newUser.transactions = newUser.transactions.concat(dailyAllowance._id)
  newUser.balance = dailyAllowance.balanceRemaining
  await newUser.save()

  response.json(savedUser);

});

userRouter.delete("/:id", async (request, response) => {
  await User.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

userRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const savedUser = await User.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  );

  if (!savedUser) {
    return response.status(400).end();
  }

  response.json(savedUser);
});

module.exports = userRouter;

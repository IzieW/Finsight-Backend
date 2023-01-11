const User = require("../models/user");

const initialUsers = [
  {
    username: "test",
    name: "test",
    password: "testing123",
    allowance: 10,
    balance: 10,
  },
  {
    username: "test2",
    name: "test2",
    password: "testing234",
    allowance: 20,
    balance: 10,
  },
];

const nonExistingId = async () => {
  const user = new User({
    username: "todelete",
    name: "todelete",
    password: "todeleto",
  });

  await user.save();
  await user.remove();

  return user.id.toString();
};

const getUsers = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialUsers,
  getUsers,
  nonExistingId,
};

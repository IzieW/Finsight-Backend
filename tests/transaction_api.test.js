const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

const transactionHelper = require("./transaction_helper");
const userHelper = require("./user_helper");

const Transaction = require("../models/transactions");
const User = require("../models/user");

const URL = "/api/transactions";

beforeEach(async () => {
  await Transaction.deleteMany();
  await Transaction.insertMany(transactionHelper.initialTransactions);

  await User.deleteMany();
  await User.insertMany(userHelper.initialUsers);
});

describe("Calling transactions", () => {
  test("returns all transactions as JSON", async () => {
    transactions = await api
      .get(URL)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(transactions.body).toHaveLength(
      transactionHelper.initialTransactions.length
    );
  });
});

describe("Creating new transaction", () => {
  test("succeeds with valid token", async () => {
    const token = await transactionHelper.getToken();

    const newTransaction = {
      reference: "transaction",
      amount: 10,
    };

    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(newTransaction)
      .expect(200);
  }, 10000);

  test("correctly updates user transactions and balance", async () => {
    const token = await transactionHelper.getToken();

    const usersBefore = await userHelper.getUsers();
    const userBefore = usersBefore[0];

    const newTransaction = {
      reference: "transaction",
      amount: 10,
    };

    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(newTransaction)
      .expect(200);

    const usersAfter = await userHelper.getUsers();
    const userAfter = usersAfter[0];

    expect(userAfter.transactions).toHaveLength(
      userBefore.transactions.length + 1
    );
    expect(userAfter.balance).toBe(userBefore.balance + newTransaction.amount);
  });
  test("fails with status code 401 if token missing", async () => {
    const newTransaction = {
      reference: "transaction",
      amount: 10,
    };

    await api.post(URL).send(newTransaction).expect(401);
  });
  test("fails with status code 404 if amount missing or NaN", async () => {
    const token = await transactionHelper.getToken();

    const missingAmount = {
      reference: "transaction",
    };

    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(missingAmount)
      .expect(404);

    const amountIsString = {
      reference: "transaction",
      amount: "not a number",
    };

    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(amountIsString)
      .expect(404);
  });
});

describe("deleting a transaction", () => {
  test("succeeds with valid token and transaction id", async () => {
    const token = await transactionHelper.getToken();

    const transactionToDelete = transactionHelper.initialTransactions[0];

    // Post transaction
    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(transactionToDelete)
      .expect(200);

    const transactions = await transactionHelper.getTransactions();
    const transaction = transactions.pop();

    await api
      .delete(`${URL}/${transaction.id}`)
      .set("Authorization", `bearer ${token}`)
      .expect(200);

    const transactionsAfter = await transactionHelper.getTransactions();
    expect(transactionsAfter).toHaveLength(
      transactionHelper.initialTransactions.length
    );
  });

  test("correctly updates user balance and transactions", async () => {
    const token = await transactionHelper.getToken();

    const transactionToDelete = transactionHelper.initialTransactions[0];

    const usersBefore = await userHelper.getUsers();
    const userBefore = usersBefore[0];

    // Post transaction
    await api
      .post(URL)
      .set("Authorization", `bearer ${token}`)
      .send(transactionToDelete)
      .expect(200);

    const transactions = await transactionHelper.getTransactions();
    const transaction = transactions.pop();

    await api
      .delete(`${URL}/${transaction.id}`)
      .set("Authorization", `bearer ${token}`)
      .expect(200);

    const usersAfter = await userHelper.getUsers();
    const userAfter = usersAfter[0];

    expect(userAfter.transactions).toHaveLength(userBefore.transactions.length);
    expect(userAfter.balance).toBe(userBefore.balance);
  });
  test("fails with status code 404 if transaction does not exist", async () => {
    const nonExistantID = await transactionHelper.nonExistingId();
    const token = await transactionHelper.getToken();

    await api
      .delete(`${URL}/${nonExistantID}`)
      .set("Authorization", `bearer ${token}`)
      .expect(404);
  });
  test("fails with status code 400 if token invalid", async () => {
    const transactions = await transactionHelper.getTransactions();
    const transactionToDelete = transactions[0];

    await api.delete(`${URL}/${transactionToDelete.id}`).expect(400);
  });
});

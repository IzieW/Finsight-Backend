const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

const helper = require("./user_helper")

const User = require("../models/user")

const URL = "/api/login"


const user = {
    username: "username",
    password: "password",
    name: "name",
    allowance: 10
}

beforeAll( async () => {

    await User.deleteMany({})
    
    await api.post("/api/users")
                .send(user)
                .expect(200)

})


describe("user login", () => {
    test("succeeds with valid username and password", async () => {

        await api.post(URL)
                .send({
                    username: user.username,
                    password: user.password
                })
                .expect(200)
                .expect("Content-Type", /application\/json/)
    })
    test("fails with status code 401 if username or password are incorrect", async () => {
        await api.post(URL)
                .send({
                    username: "incorrect",
                    password: user.password
                })
                .expect(401)
        
        await api.post(URL)
                .send({
                    username: user.username,
                    password: "incorrect"
                })
                .expect(401)
    })
    test("fails with status code 404 if username or password are missing", async () => {
        await api.post(URL)
                .send({
                    password: user.password
                })
                .expect(404)
        
        await api.post(URL)
                .send({
                    username: user.username,
                })
                .expect(404)
    })
})
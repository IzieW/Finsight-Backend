const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")

const api = supertest(app)

const User = require("../models/user")
const helper = require("./user_helper")

const URL = "/api/users"

beforeEach( async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
})



describe("Calling users", () => {
    test("all users are returned as JSON", async ()=> {
        const response = await api
                        .get(URL)
                        .expect(200)
                        .expect("Content-Type", /application\/json/)

        expect(response.body).toHaveLength(2)
        const usernames = response.body.map(i => i.username)
        expect(usernames).toContain(helper.initialUsers[0].username)
        expect(usernames).toContain(helper.initialUsers[1].username)
    })

    test("viewing a specific user returns a single user", async ()=> {
        const userToView = await helper.getUsers()

        const userRequest = await api
                            .get(`${URL}/${userToView[0].id}`)
                            .expect(200)
                            .expect("Content-Type", /application\/json/)
        
        expect(userRequest.body.username).toBe(helper.initialUsers[0].username)
    })

    test("viewing a nonexistent user fails with status code 404", async () => {
        const deletedID = await helper.nonExistingId()

        console.log("id", deletedID)

        await api.get(`${URL}/${deletedID}`)
                    .expect(404)
    }, 10000)
})

describe("addition of a new user", () => {
    test("succeeds when user is valid and unique", async () => {
        const newUser = {
            username: "kooks",
            name: "kooka",
            password: "kookly",
            allowance: 10
        }

        await api
                .post(URL)
                .send(newUser)
                .expect(200)
                .expect("Content-Type", /application\/json/)
        
        const users = await helper.getUsers()

        expect(users).toHaveLength(helper.initialUsers.length + 1)
        
        const usernames = users.map(i=> i.username)
        expect(usernames).toContain("kooks")
    })

    test("sets user balance to the amount in their allowance", async () => {
        const newUser = {
            username: "kooks",
            name: "kooka",
            password: "kookly",
            allowance: 10
        }

        const user = await api.post(URL)
                    .send(newUser)
                    .expect(200)

        expect(user.body.balance).toBe(10)

    })

    test("fails with status code 400 when user is not unique", async () => {
        const repeatUser = helper.initialUsers[0]

        await api.post(URL)
                .send(repeatUser)
                .expect(400)
    })

    test("fails with status code 400 when information is missing", async ()=> {
        const missingUsername = {
            name: "username missing",
            password: "kooks",
            allowance: 10
        }

        await api.post(URL)
                .send(missingUsername)
                .expect(400)
        
        const missingPass = {
            username: "loop",
            allowance: 10
        }

        await api.post(URL)
                .send(missingPass)
                .expect(400)
    })

    test("fails with status code 400 when allowance is not a number", async ()=> {
        const newUser = {
            username: "kooks",
            password: "loops",
            name: "mooks",
            allowance: "soops"
        }

        await api.post(URL)
                .send(newUser)
                .expect(400)
    })
})

describe("editing an existing user", ()=> {
    test('succeeds with valid user ID', async ()=> {
        const usersBefore = await helper.getUsers()
        const edit = {
            allowance: 15
        }

        await api.put(`${URL}/${usersBefore[0].id}`)
                .send(edit)
                .expect(200)
                .expect("Content-Type", /application\/json/)
        
        const usersAfter = await helper.getUsers()

        expect(usersAfter[0].allowance).toBe(15)
        
    })

    test("fails with nonexistent user ID", async () => {
        const nonExistantID = await helper.nonExistingId()

        const edit = {
            balance: 10
        }

        await api.put(`${URL}/${nonExistantID}`)
                .send(edit)
                .expect(400)
    })
})

afterAll( () => {
    mongoose.connection.close()
})
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const bodyparser = require("body-parser")
const bcrypt = require("bcrypt")
const { urlencoded } = require("body-parser")
const { userModel } = require('./model/model')

const app = express()

const url =
    "mongodb+srv://databose:databose123@cluster0.w6zhawy.mongodb.net/databoseDb?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }, () => {
    console.log('db connected');
});

app.use(cors())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json())

app.get("/api/getproduct", (req, res) => {
    res.send("products")
})

app.post("/api/signup", async (req, res) => {
    let user = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password

    };
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(user.password, salt);
    user.password = hash;//encription

    const newUser = new userModel(user)
    newUser.save((err, data) => {
        if (err) {
            res.send(err)
        } else {

            res.send(data)
        }
    })

})

app.listen("3000", () => {
    console.log("connected to 3000")
})

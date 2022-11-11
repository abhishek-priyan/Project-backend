const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const { urlencoded } = require("body-parser");
const { userModel } = require("./model/model");

const app = express();

const url =
  "mongodb+srv://databose:databose@cluster0.w6zhawy.mongodb.net/databoseDb?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }, () => {
  console.log("db connected");
});

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/api/addproduct", (req, res) => {
  const product= req.body
  console.log(product)
  const productadd = new userModel(product)
  productadd.save((err,data)=>{
    if (err) {
      res.send({'status':'error'})
    } else {
      res.send({'status':'success','data': data})
    }
  })
});

app.get('/api/viewproducts',(req,res)=>{

  userModel.find((err,data)=>{
    if (err) {
      res.send("error find in view API")
    } else {
      res.send(data)
      
    }
  })



}); 

app.post("/api/signup", async (req, res) => {
  let user = {
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    password: req.body.password,
  };
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(user.password, salt);
  user.password = hash; //encription

  const newUser = new userModel(user);
  newUser.save((err, data) => {
    if (err) {
      res.json({ success: false });
    } else {
      res.json({ success: true, data });
    }
  });
});
app.post("/api/login", async(req,res)=>{
  let user ={
    email:req.body.email,
    password:req.body.password,
  }
  const loginUser = new userModel(user);
  loginUser.save((err,data)=>{
    if (err) {
      res.json({success: false});
    } else {
      res.json({success: true, data});
    }


  });


});

app.listen("3000", () => {
  console.log("connected to 3000");
});

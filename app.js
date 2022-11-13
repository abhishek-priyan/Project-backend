const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const { urlencoded } = require("body-parser");
const  UserModel  = require("./model/user");
const  ProductModel  = require("./model/product");
const  HotdealsModel  = require("./model/hotdeals");
const  RecentModel  = require("./model/recent");
const product = require("./model/product");

const app = express();

const url =
  "mongodb+srv://databose:databose@cluster0.w6zhawy.mongodb.net/databoseDb?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }, () => {
  console.log("db connected");
});

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


  // Add Section

app.post("/api/addproduct", (req, res) => {
  let product={
    
    name:req.body.name,
    price:req.body.price,
    images:req.body.images,
    model:req.body.model,
    description:req.body.description,
    company:req.body.company,


  };
  
  console.log(product);
  const productadd = new ProductModel(product);
  productadd.save((err,data)=>{
    if (err) {
      res.json({ status: "error" });
    } else {
      res.json({ status: "success", data: data });
    }
   
   
   
  });
});
app.post("/api/hotdeals", async(req, res) => {
  let hotdeal={
    
    name:req.body.name,
    price:req.body.price,
    images:req.body.images,
    model:req.body.model,
    description:req.body.description,
    company:req.body.company,


  }
  const hotdealadd = new HotdealsModel(hotdeal);
   hotdealadd.save((err,hotdeal)=>{
    if (err) {
      res.json({'status':'error'})
    } else {
      res.json({'status':'success',"data": hotdeal})
    }
  });
});
app.post("/api/recents", async(req, res) => {
  let recent={
    
    name:req.body.name,
    price:req.body.price,
    images:req.body.images,
    model:req.body.model,
    description:req.body.description,
    company:req.body.company,


  }
  const recentadd = new RecentModel(recent);
  recentadd.save((err,recent)=>{
    if (err) {
      res.json({'status':'error'})
    } else {
      res.json({'status':'success',"data": recent})
    }
  });
});


// View Section

app.get('/api/viewproducts',async(req,res)=>{


   ProductModel.find((err,data)=>{
    if (err) {
      res.json("error find in view API")
    } else {
      res.json({data: data})
      
    }
  });
}); 

app.get('/api/viewhotdeals',async(req,res)=>{


  HotdealsModel.find((err,data)=>{
    if (err) {
      res.json("error find in view API")
    } else {
      res.json({data: data})
      
    }
  });
}); 


// Delete section

app.post("/api/deleteproduct", (req, res) => {
  var data = req.body;
  ProductModel.deleteOne(data, (error, data) => {
    if (error) {
      res.json({ "status": "error" });
    } else {
      res.json({ "status": "success","data":data });
    }
  });
});
app.post("/api/deletehotdeals", (req, res) => {
  var data = req.body;
  HotdealsModel.deleteOne(data, (error, data) => {
    if (error) {
      res.json({ "status": "error" });
    } else {
      res.json({ "status": "success","data":data });
    }
  });
});
app.post("/api/deleterecent", (req, res) => {
  var data = req.body;
  RecentModel.deleteOne(data, (error, data) => {
    if (error) {
      res.json({ "status": "error" });
    } else {
      res.json({ "status": "success","data":data });
    }
  });
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

  const newUser = new UserModel(user);
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
  const loginUser = new UserModel(user);
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

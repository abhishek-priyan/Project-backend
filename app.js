const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const { urlencoded } = require("body-parser");
const UserModel = require("./model/user");
const ProductModel = require("./model/product");
const orderModel = require("./model/order");
// const HotdealsModel = require("./model/hotdeals");
const RecentModel = require("./model/recent");
const product = require("./model/product");
const jwt = require("jsonwebtoken");
const app = express();
const Cart = require("./model/cart");
const {generaterazorpay} = require('./razorpay') 
const {signatureVerification} = require('./razorpay') 

const url =
  "mongodb+srv://databose:databose@cluster0.w6zhawy.mongodb.net/databoseDb?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true }, () => {
  console.log("db connected");
});

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


// View Section
app.get("/api/viewall", (req, res) => {
  ProductModel.find((err, data) => {
    
    if (err) {
      res.send("error find in view API");
    } else {
      res.json({data:data});
    }
  });
});


app.post("/api/viewProducts", async (req, res) => {
  let tag=req.body.tag
  console.log(tag);
  ProductModel.find({ tag: tag }, (err, data) => {
    if (err) {
      res.json({ success: "false" });
    } else {
      res.json({ success: "true", data: data });
    }
  });
});

//ONE PRODUCT FORM HOTDEALS
app.post("/api/oneHotDealsProdcuts", (req, res) => {
  let id = req.body.id;
  ProductModel.findById({ _id: id }, (err, product) => {
    if (err) {
      throw err;
    } else {
      res.json({ data: product });
    }
  });
});

// Delete section

app.post("/api/deleteproduct", (req, res) => {
  var data = req.body;
  ProductModel.deleteOne(data, (error, data) => {
    if (error) {
      res.json({ status: "error" });
    } else {
      res.json({ status: "success", data: data });
    }
  });
});


//VIEW PRODUCT PAGE
app.post("/api/viewproductpage", (req, res) => {
  var data = req.body;
  RecentModel.findById(data, (error, data) => {
    if (error) {
      res.json({ status: "error" });
    } else {
      res.json({ status: "success", data: data });
    }
  });
});
//SIGN UP
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

//SIGN IN
app.post("/api/login", async (req, res) => {
  const usercred = {
    email: req.body.email,
    password: req.body.password,
  };
  const admincred = {
    email: "admin@gmail.com",
    password: "admin123",
  };
  if (usercred.email === admincred.email) {
    if (usercred.password === admincred.password) {
      payload = { email: admincred.email };
      let token = jwt.sign(payload, "ict");
      res.json({
        success: true,
        token: `Bearer ${token}`,
        user: { email: admincred.email, id: "123" },
        isAdmin: true,
      });
    } else {
      res.json({ success: false, msg: "Incorrect Password" });
    }
  } else {
    let user = await UserModel.findOne({ email: usercred.email }); //find the email in db

    if (!user) {
      res.json({ success: false, msg: "User is not Found" });
    } else {
      let isMatch = await bcrypt.compare(usercred.password, user.password); // checking the password
      if (!isMatch) {
        res.json({ success: false, msg: "Incorrect Password" });
      } else {
        payload = { email: user.email };
        let token = jwt.sign(payload, "ict");
        res.json({
          success: true,
          token: `Bearer ${token}`,
          isAdmin: false,
          user: { name: user.name, email: user.email, id: user._id },
        });
      }
    }
  }
});

//ADD CART
app.post("/api/addToCart", async (req, res) => {
  console.log(req.body);
  let userId = req.body.userId;
  let productId = req.body.productId;

  let userCart = await Cart.findOne({ userId: userId });
  //if there is a cart for user already
  if (userCart) {
    let proExist = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
      // mongoose.Types.ObjectId(productId)
    );
    console.log(proExist);
    //if the product is exist in the cart
    if (proExist != -1) {
      console.log('exi');
      Cart.findOneAndUpdate(
        {
          userId: userId,
          "products.productId": mongoose.Types.ObjectId(productId),
        },
        { $inc: { "products.$.quantity": 1 } },
        (err, data) => {}
      );
    } else {
      //if the product is not exist in the cart
      console.log('no exi');
      let cart = await Cart.findOne({ userId: userId });
      let updated = await cart.update({
        $push: {
          products: {
            productId: mongoose.Types.ObjectId(productId),
            quantity: 1,
          },
        },
      });
    }
  } else {
    //if there is no cart in the name of user
    let cart = new Cart({
      userId: userId,
      products: [{ productId: productId, quantity: 1 }],
    });
    cart.save((err, data) => {
      if (err) {
        throw err;
      } else {
        res.json({ sucess: true, msg: "new cart created" });
      }
    });
  }
});

//SEND CART
app.post("/api/sendCart", async (req, res) => {
  let user = req.body.userId;
  let cart = await Cart.find({ userId: user });
  if (cart.length === 0) {
    res.json({ success: false, msg: "cart is empty" });
    console.log("false");
  } else {
    let data = await Cart.aggregate([
      {
        $match: { userId: user },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          productId: "$products.productId",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
    ]);
    res.json({ success: true, data: data });
  }
});

//ADD PRODUCT
app.post("/api/addProduct", async (req, res) => {
  let product = {
    name: req.body.name,
    price: req.body.price,
    images: req.body.images,
    model: req.body.model,
    description: req.body.description,
    company: req.body.company,
    tag: req.body.tag,
  };

  console.log(product);
  const productadd = new ProductModel(product);
  productadd.save((err, data) => {
    if (err) {
      res.json({ status: "error" });
    } else {
      res.json({ status: "success", data: data });
    }
  });
});

app.listen("3000", () => {
  console.log("connected to 3000");
});

//TO GET TOTAL
app.post("/api/totalAmount", async (req, res) => {
  let user = req.body.userId;
  let total = await Cart.aggregate([
    {
      $match: { userId: user },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        productId: "$products.productId",
        quantity: "$products.quantity",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        productId: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: { $multiply: ["$quantity", "$product.price"] },
        },
      },
    },
  ]);
  if (total) {
    res.json({ success: true, total: total });
  } else {
    res.json({ success: false, msg: "unable to find the total" });
  }
});

app.post("/api/checkout", async (req, res) => {
  let user = req.body.userId;
  let total = req.body.totalAmount;
  let address = req.body.address;
  let pincode = req.body.pincode;
  let phone = req.body.phone;
  let products = await Cart.aggregate([
    { $match: { userId: user } },
    { $project: { products: 1 } },
  ]);
  let paymentMethod = req.body.paymentMethod;
  let status = paymentMethod === "online" ? "pending" : "placed";

  let newOrder = {
    deliveryDetails: {
      address: address,
      pincode: pincode,
      phone: phone,
    },
    products: products,
    userId: user,
    paymentMethod: paymentMethod,
    status: status,
    total: total,
    orderedAt: new Date(),
  };
  let order = new orderModel(newOrder);
  order.save((err, data) => {
    if (err) {
      res.json({ success: false, msg: "failed to place a order" });
    } else {
      if (paymentMethod === "cod") {
        res.json({ CODsuccess: true, msg: "placed your cod order" });
      } else {
        generaterazorpay(data._id, total).then((result) => {
          res.json({ success: true, order: result });
        });
      }
    }
  });
});

//PAYMENT VERIFICATION
app.post("/api/verifyPayment", (req, res) => {
  let orderId = req.body.razorpay_order_id;
  let paymentId = req.body.razorpay_payment_id;
  let signature = req.body.razorpay_signature;
  let id = req.body.receipt;
  let userId = req.body.userId;

  signatureVerification(
    //payment_verification
    orderId,
    paymentId,
    signature
  )
    .then((response) => {
      //ifSuccessFull
      //orderPlaced
      orderModel.updateOne(
        { _id: id },
        { $set: { status: "placed" } },
        (err, data) => {
          if (err) {
            throw err;
          } else {
            //removeCart
            Cart.findOneAndRemove({ userId: userId }, (err, data) => {
              if (err) {
                throw err;
              } else {
                res.json({ success: true, msg: "payment success" });
              }
            });
          }
        }
      );
    })
    .catch((err) => {
      //ifFailed
      console.log("failed" + err);
      res.json({ success: false, msg: "payment failed" });
    });
});
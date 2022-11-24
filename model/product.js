const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: String,
  price: Number,
  images: String,
  model: String,
  description: String,
  company: String,
  tag:String
});

const ProductModel = (module.exports = mongoose.model(
  "Products",
  ProductSchema
));

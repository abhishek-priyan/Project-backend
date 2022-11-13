const mongoose= require("mongoose")

const ProductSchema = 
     mongoose.Schema(
        {
            name:String,
            price:String,
            images:String,
            model:String,
            description:String,
            company:String


        }

    )

    const ProductModel= module.exports = mongoose.model("products",ProductSchema)
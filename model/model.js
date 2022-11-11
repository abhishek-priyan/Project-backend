    const mongoose = require("mongoose")

    const userModel = mongoose.model
    ("users", mongoose.Schema(
        {
            name:String,
            email:String,
            address:String,
            phone:String,
            password:String,


        }

    ))

    module.exports ={userModel}
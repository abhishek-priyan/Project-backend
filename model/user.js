const mongoose= require("mongoose")

const UserSchema = 
     mongoose.Schema(
        {
            name:String,
            email:String,
            address:String,
            phone:String,
            password:String,


        }

    )

    const UserModel= module.exports = mongoose.model("users",UserSchema)
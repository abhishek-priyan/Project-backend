const mongoose= require("mongoose")

const HotdealSchema = 
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

    const HotdealsModel= module.exports = mongoose.model("hotdeals",HotdealSchema)
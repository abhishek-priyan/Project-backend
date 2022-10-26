const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose")
const bodyparser=require("body-parser")
const { urlencoded } = require("body-parser")

const app=express()

app.use(cors())
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

app.get("/api/getproduct",(req,res)=>{
    res.send("products")
})

app.listen("3000",()=>{
    console.log("connected to 3000")
})

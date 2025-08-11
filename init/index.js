const express=require("express");
const app=express();
const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to database");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect( MONGO_URL);
}
app.get("/",(req,res)=>{
    res.send("Hi,i am root")
})

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:'686698e6cfa977d39a2dc981',
    }))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();

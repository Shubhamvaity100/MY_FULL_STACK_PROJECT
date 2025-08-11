const session=require("express-session");
const express=require("express");
const app=express();
const port=3000;
const flash=require("connect-flash");
app.set("view engine", "ejs");
const path=require("path");
app.set("views", path.join(__dirname, "views"));
const sessionOptions={ secret:"thisismysecret",
    resave:false,
    saveUninitialized:true,};



app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})

app.use(session(sessionOptions));
app.use(flash());

app.get("/register",(req,res)=>{
    let {name='anonymous'}=req.query;
    req.session.name=name;
    req.flash("success","welcome to the website");
    res.send(`${name}` )
})

app.get("/hello",(req,res)=>{
    res.render("page.ejs", {name:req.session.name,success:req.flash("success")});
})


// app.get("/reqcount",(req,res)=>{
//     if(req.session.count){
//         req.session.count++;
//     }
//     else{
//         req.session.count=1;
//     }
//     res.send(`you have visited this page ${req.session.count} times`)
// })

app.get("/test",(req,res)=>{
res.send("test sucessfull")

})  
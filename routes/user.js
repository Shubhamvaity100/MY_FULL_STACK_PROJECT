const express = require("express");
const router = express.Router();
const User=require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl } = require("./middleware");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});



router.post("/signup", wrapAsync(async(req, res) => {
   try{let {username,email,password}=req.body;
   const newUser=new User({username,email});
   const registeredUser=await User.register(newUser,password);
   console.log(registeredUser);
   req.login(registeredUser,(err)=>{
       if(err){
           return next(err);
       }
       req.flash("success","Successfully registered");
   res.redirect("/listings");
   });

   }catch(e){
       req.flash("error",e.message);
       res.redirect("/signup");
   }
}));

router.post("/login", saveRedirectUrl, passport.authenticate('local', {failureRedirect:"/login" ,failureFlash:true}),
    wrapAsync(async(req, res) => {
    req.flash("success","Successfully logged in");
    res.redirect(res.locals.redirectUrl || "/listings" );
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});


 router.get("/logout",(req,res,next)=>{
    req.logout((err) =>{
        if(err){
            return next(err);
        }
        else{
            req.flash("success","Successfully logged out");
            res.redirect("/listings");
        }       
    })
 });
module.exports = router;

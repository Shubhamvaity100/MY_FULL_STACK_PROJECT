if(process.env.NODE_ENV!=="production"){
  require("dotenv").config();
};
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const flash = require("connect-flash");
const userRouter=require("./routes/user.js");

// const UserActivation=require("./models/userActivation.js");
const sessionOptions={
  secret:"thisismysecret",
  resave:false,
  saveUninitialized:true,
  cookie:{expires:Date.now()+1000*60*60*24*7,
  maxAge:1000*60*60*24*7,
  httpOnly:true,
  }
  
};

// Root route
// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// passport.session();
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});


// app.get("/demouser", async (req, res) => {
//   try {
//     const uniqueName = `demouser${Math.floor(Math.random() * 10000)}`;
//     const fakeUser = new User({ email: `${uniqueName}@example.com`, username: uniqueName });
//     const registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(`User ${uniqueName} registered successfully!`);
//   } catch (e) {
//     res.status(500).send("Something went wrong: " + e.message);
//   }
// });



// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
// EJS engine setup
app.engine("ejs", ejsMate);

// MongoDB connection
// MongoDB connection
// Make sure this line looks EXACTLY like this:
// const MONGO_URL = process.env.MONGO_URI || "mongodb://host.docker.internal:27017/wanderlust";
const MONGO_URL = process.env.MONGO_URI;

main().catch((err) => {
  console.log("Database connection error:", err);
  process.exit(1);
});

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log(`Database connected to ${MONGO_URL}`);
}

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));



// Mount Routers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter)  

// Catch-all route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const { statuscode = 500, message = "Something went wrong!" } = err;
  res.status(statuscode).render("error.ejs", { message, statuscode });
});

// Start Server
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

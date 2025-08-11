const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const LocalStrategy=require("passport-local");
const { isLoggedIn, isOwner }= require("../routes/middleware.js");
const listingController=require("../controllers/listings.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });


// Middleware to validate listing
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMsg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

// Listings index
router.get("/",wrapAsync(listingController.index));

// New listing form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Show listing
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  })
  .populate("owner");

if (!listing) {
  req.flash("error", "The listing you requested could not be found.");
  return res.redirect("/listings"); // Added return to prevent further execution
  // throw new ExpressError(404, "Listing not found"); // Optional: uncomment for API use
}

  console.log(listing);

  res.render("listings/show", { listing });
}));


// Create listing
router.post("/", isLoggedIn,upload.single("listing[image]"), wrapAsync(async (req, res) => {
  let url=req.file.path;
  let filename=req.file.filename;
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image={url,filename};
  await newlisting.save();
  req.flash("success", "Successfully created a new listing!");
  res.redirect("/listings");
}));

// Edit listing form
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  res.render("listings/edit", { listing });
}));

// Update listing
router.put("/:id", isLoggedIn,isOwner, upload.single("listing[image]"),validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const { price } = req.body.listing;

  // let listing = await Listing.findById(id);


  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  if (price < 0) {
    throw new ExpressError(400, "Price cannot be negative");
  }

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file!=='undefined'){
    let url =req.file.path;
  let filename =req.file.filename;
  listing.image={url,filename};
  await listing.save(); 
  }
  


  req.flash("success", "Successfully updated a listing!");
  res.redirect(`/listings/${id}`);
}));

// Delete listing
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res) => {
  let { id } = req.params;
   let listing = await Listing.findById(id);

  if (!req.user || !listing.owner._id.equals(req.user._id)) {
  req.flash("error", "You do not have permission to delete this listing");
  return res.redirect(`/listings/${id}`);
}

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully Deleted a  listing!");
  res.redirect("/listings");
}));

module.exports = router;

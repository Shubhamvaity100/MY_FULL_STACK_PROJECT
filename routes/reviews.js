const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const {isLoggedIn}=require("../routes/middleware.js");
const review = require("../models/review.js");

// Middleware to validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    const errorMsg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

// Create review
router.post("/", isLoggedIn ,validateReview, wrapAsync(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }

  const listing = await Listing.findById(id);
  const review = new Review(req.body.review);
  listing.reviews.push(review);
  review.author=req.user._id;

  await review.save();
  await listing.save();
  req.flash("success", "Successfully created a new review!");

  res.redirect(`/listings/${id}`);
}));

// Delete review
router.delete("/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID format");
  }
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ExpressError(400, "Invalid review ID format");
  }

  const listing = await Listing.findById(id);
  const review = await Review.findById(reviewId); // 
  if (!listing || !review) {
    req.flash("error", "Listing or review not found");
    return res.redirect("/listings");
  }

  // ✅ Check if the logged-in user is the review's author
  if (!review.author || !review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this review.");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;

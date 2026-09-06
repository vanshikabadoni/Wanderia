const express=require("express");
const router=express.Router({ mergeParams: true });
const Review=require("../models/reviews.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn, isOwner,isAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");


//REVIEW ROUTESSsss
//POST route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.postReview));

//delete review route
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.destroy));

module.exports=router;
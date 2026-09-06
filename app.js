if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}

const express=require("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const {MongoStore}=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStategy=require("passport-local");
const User=require("./models/user.js");



const listingsRouter=require("./routes/listing.js");
const reviewsRouter= require("./routes/review.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

//db connection
const dbURL=process.env.ATLASDB_URL;
async function main(){
  await mongoose.connect(dbURL);
}
main()
.then((res)=> console.log("connection established"))
.catch((err)=> console.log(err));


//mongo-store :for session storage in production
const store=MongoStore.create({
  mongoUrl:dbURL,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600
});


store.on("error",(err)=>{
  console.log("Error in MONGO Session Store",err);
});
const sessionOptions={
  store:store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookies:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MIDDLEWARE FOR FLASHHH
app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});



app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/user",userRouter);
app.get("/", (req, res) => {
    res.redirect("/listings");
});


//ERRROR HANDLING
app.all("/*splat",(req,res,next)=>{
  next(new ExpressError(404,"Page not Found!"));
});

//MIDDLEWARE
app.use((err,req,res,next)=>{
  let{statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening");
});

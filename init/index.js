const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const data=require("./data.js");

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
main()
.then((res)=> console.log("connection established"))
.catch((err)=> console.log(err));

const initDB=async()=>{
  await  Listing.deleteMany({});
const listingWIthOwner= data.data.map((obj)=>({...obj,owner:"6a95525cf3a907b79357683a"}));
 await   Listing.insertMany(listingWIthOwner);
 console.log("data initialsed");
};
initDB();
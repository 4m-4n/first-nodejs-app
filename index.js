
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const cookieParser = require("cookie-parser");
const { nextTick } = require("process");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");

mongoose.connect("mongodb://localhost:27017/", {     //connection to database
   dbName: "backend",
}).then(() => console.log("database connected"));

const userschema = new mongoose.Schema({     //schema creation 
   name: String, email: String , password:String
});

const User = mongoose.model("User", userschema); //collection creation

const app = express();
app.listen(5000, () => {
   console.log("server is running");
})
const isauthenticate = async(req, res, next) => {
   const { token } = req.cookies;
   if (token) {
      const decoded=jwt.verify(token,"abcdgskjskjkjsds");
      req.user = await User.findById(decoded._id);

      next();
   }
   else {
      res.redirect("/login");
   }
}
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.get("/", isauthenticate, (req, res) => {
   res.render("logout",{name:req.user.name});

});
app.get("/register", (req, res) => {
   res.render("register");

});
app.get("/login",(req,res)=>{
   res.render("login");
})

app.get("/logout", (req, res) => {
   res.cookie("token", null, {
      httponly: true,
      expires: new Date(Date.now()),
   });
   res.redirect("/");
})

app.post("/register",async(req, res) => {
   const {name,email,password}=req.body;
   
  let user=await User.findOne({email});
   if(user){
      return res.redirect("/login");
   } 
   const hashedpass=await bcrypt.hash(password,10);

   user= await User.create({
      name,
      email,
      password: hashedpass
   });
   const token =jwt.sign({_id: user._id},"abcdgskjskjkjsds");

   res.cookie("token", token, {
      httponly: true,
      expires: new Date(Date.now() + 60 * 1000),
   });
   res.redirect("/");
});
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    const userr=await User.findOne({email});
    if(!userr){
      return res.redirect("/register");
    }
    const ismatch=await bcrypt.compare(password,hashedpass);
    if(!ismatch){
      return res.render("login",{email,message:"incorrect password!!!"});
    }

    const token =jwt.sign({_id: userr._id},"abcdgskjskjkjsds");

   res.cookie("token", token, {
      httponly: true,
      expires: new Date(Date.now() + 60 * 1000),
   });
   res.redirect("/");
})


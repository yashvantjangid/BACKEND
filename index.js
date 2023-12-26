import express, { urlencoded } from  "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { error } from "console";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
}).then(()=>console.log("database Connected")).catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email: String,
    password: String,
});
const User = mongoose.model("User",userSchema);

const app = express();

app.use(express.static(path.join(path.resolve(),"public")));
app.use(urlencoded({extended:true}));
app.use(cookieParser());

app.set("view engine","ejs");

const isAuthenticated = async(req,res, next) =>{
    const{ token}= req.cookies;
    if(token){
     const decoded =  jwt.verify(token,"sdsad")
    
    req.user = await User.findById(decoded._id)
    
    res.render("logout",{name:req.user.name});
    }
    else{
        res.redirect("login");
    }
}

app.get("/", isAuthenticated,(req,res,)=>{
   
   console.log(req.user);
       res.render("logout",{name:req.user.name});
});

app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/",(req, res)=>{
    console.log(req.cookies);
    res.render("login")
});



app.get("/logout",(req,res)=>{
    res.cookie("token",null ,{
        expires:new Date(Date.now()),
    });
    res.redirect("/");
})



app.post("/register",async(req,res)=>{
    const {name , email,password}=req.body;
    
    
   let checkUser = await User.findOne({email});
   console.log(checkUser);
   if(checkUser){
     return res.redirect("/logout");
   }
//    console.log("CHeck user Done");  
   
   const hashedPassword = await bcrypt.hash(password,10);


    const user = await User.create({
       name,
       email,
       password: hashedPassword,
    }).catch(error => {
        
        console.log("register-error-",error);
    })
 
   
   const token =jwt.sign({_id:user._id},"sdsad");
   console.log(token);
   
   res.cookie("token" , token,{
       httpOnly:true,
       expires:new Date(Date.now() + 60 * 1000),
   
   });
       res.redirect("/");
   })
   
app.post("/login",async(req,res)=>{
 const {name , email,password}=req.body;
 
let user = await User.findOne({email});
if(!user){
  return res.redirect("/register");
}
 

  const isMatch =await bcrypt.compare(password, user.password);

//   console.log(isMatch);
  if(!isMatch) return res.render("login", {email, message:"Incorrect Password"})

const token =jwt.sign({_id:user._id},"sdsad");
// console.log(token);

res.cookie("token" , token,{
    httpOnly:true,
    expires:new Date(Date.now() + 60 * 1000),

});


res.render("logout",user);

})


// app.post("/",async(req,res)=>{

//    await user.create({name:req.body.name, email:req.body.email});
//    res.end("Message sent successfully");
// })


app.listen(5000, ()=>{
    console.log("server is working");
})
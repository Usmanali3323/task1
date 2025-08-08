import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connect } from "./db/db.js";
import path from "path"
import { fileURLToPath } from 'url';
import User from "./models/user.model.js";
import { title } from "process";
import { error } from "console";

const app = express();

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//mongodb connection
connect();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//render register.ejs 
app.get('/', (req, res) => {
  res.render("register", { title: "Register Page", route:"login"}); // <--- this is required
});

//register user store in mongodb
app.post('/register',async(req,res)=>{
const {name,email,password} = req.body;
if(!email && !password && name){
    res.send("All field are required")
}
try {    
const newUser = await User.create({
    name,
    email,
    password
})
newUser.save();
} catch (error) {
 res.render("error",{error})  
}
res.redirect('/login')
})


//render login.ejs
app.get('/login',(req,res)=>{
    res.render("login",{title:"login page",route:"register"})
})


//login user check authentic
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return  res.render("error",{error:"email and password is required"}) 
  }

  try {
    const getUser = await User.findOne({ email });

    if (!getUser) {
      return  res.render("error",{error:"user not found"}) ;
    }

    const checkPassword = await getUser.comparePassword(password);

    if (!checkPassword) {
      return  res.render("error",{error:"Invalid Creditional"}) ;
    }

    // Render dashboard and pass user data
    return res.render("dashboard", { user: getUser ,title : "dashboard",route:"logout"});

  } catch (error) {
     res.render("error",{error}) 
  }
});

const PORT = process.env.PORT || 3000;
app.listen,(PORT)=>{
    console.log(`app runing on ${PORT}`);
    
})

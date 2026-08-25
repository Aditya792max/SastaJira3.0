const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

const { JWT_SECRET, JWT_EXPIRES_IN = '1h' } = process.env;

if(!JWT_SECRET){
    throw new Error("JWT_Secret is not set in the Environment");
}

exports.register = async (req ,res) => {
    try{
        const {name, email, password, role } = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                message : "We need all the fields !!!"
            });
        }

        const existing = await User.findOne({email});
        if(existing){
            return res.status(409).json({
                message : "User Already Exists !!! "
            })
        }

        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();
        
        const payload = {
            id : user._id,
            email : user.email,
            role : user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, {expiresIn:JWT_EXPIRES_IN});
        res.status(201).json({
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            },
            token
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:"Server Error"
        });
    }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password){
        return res.status(400).json({ 
            message: 'email and password required' 
        });
    } 

    const user = await User.findOne({ email });
    if (!user){
        return res.status(401).json({ 
            message: 'Invalid credentials' 
        });
    } 


    const valid = await user.verifyPassword(password);
    if (!valid) {
        return res.status(401).json({ 
            message: 'Invalid credentials' 
        });
    }


    const payload = { 
        id: user._id, 
        email: user.email, 
        role: user.role 
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({
         token, 
         user: { 
            id: user._id,
             name: user.name, 
             email: user.email, 
             role: user.role
            }
        });
    } catch (err) {
    console.error(err);
    res.status(500).json({ 
        message: 'Server error' 
    });
  }
};

exports.getUser = async (req,res) => {
    try{
        if(req.user.role !== "manager"){
            return res.status(403).json({
                message:"Forbidden Request"
            });
        }
        const users = await User.find().select("-password");
        res.json(users);
    }catch(error){
        console.error(error);
        res.status(500).json({
            message :"Server Error"
        });
    }
};


// exports.getUser = async (req, res) => {

//     console.log(req.user.role);

// };
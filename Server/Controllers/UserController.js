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
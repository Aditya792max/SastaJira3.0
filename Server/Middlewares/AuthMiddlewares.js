const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.log("JWT_SECRET is not defined in the Environment");
}

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "The Authorization token is missing!!!"
            });
        }

        // Extract JWT from: Bearer <token>
        const token = authHeader.split(" ")[1];

        // Verify JWT
        const payload = jwt.verify(token, JWT_SECRET);

        // Fetch user from database
        const user = await User
            .findById(payload.id)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User is not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token or Token Expired"
        });
    }
};

module.exports = authenticate;
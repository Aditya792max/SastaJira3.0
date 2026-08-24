const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({
    path: path.join(__dirname, "../.env")
});

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10);
console.log(SALT_ROUNDS);

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ["user", "admin", "manager"],
        default: "user",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

/* Hash password before saving */
userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(
        this.password,
        SALT_ROUNDS
    );
});

/* Verify password */
userSchema.methods.verifyPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User",userSchema);
module.exports = User;

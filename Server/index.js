const User = require("./Models/UserModel");
const Ticket = require("./Models/TicketModel");
const Comment = require("./Models/CommentModel");

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const UserRoute = require("./Routes/UserRoutes");
const TicketRoute = require("./Routes/TicketRoutes");

const app = express();

app.use(express.json());
app.use(cors());


// User routes
app.use("/api/users", UserRoute);


// Ticket routes
app.use("/api/tickets", TicketRoute);


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully...");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
const dotenv = require('dotenv');
dotenv.config();
const UserRoute = require("./Routes/UserRoutes");

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Importing Routes in order to work on the codes.
app.use('/api/users', UserRoute);


const PORT = process.env.PORT;

app.listen (PORT, ()=>{
    console.log(`Server is runninng on ${PORT}`);
});


const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully...");
    })
    .catch((error) => {
        console.error(error);
        console.log("Error connecting to MongoDB....");
    });




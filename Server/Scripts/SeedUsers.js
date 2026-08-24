const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");

dotenv.config({
    path: path.join(__dirname, "../.env")
});

const User = require("../Models/UserModel");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the Environment");
}

const profilesPath = path.join(
    __dirname,
    "../Scripts/Profiles.json"
);

const seedUsers = async () => {
    try {
        // Read JSON file
        const profilesData = fs.readFileSync(
            profilesPath,
            "utf-8"
        );

        const profiles = JSON.parse(profilesData);

        console.log(`Found ${profiles.length} profiles`);

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);

        console.log("Connected to MongoDB successfully...");

        let insertedCount = 0;
        let skippedCount = 0;

        for (const profile of profiles) {

            // Check if email already exists
            const existingUser = await User.findOne({
                email: profile.email
            });

            if (existingUser) {
                console.log(
                    `Skipping ${profile.email} - User already exists`
                );

                skippedCount++;
                continue;
            }

            // Create user
            const user = new User({
                name: profile.name,
                email: profile.email,
                password: profile.password,
                role: profile.role
            });

            // Save user
            // Your UserModel pre("save") hook
            // will automatically hash the password
            await user.save();

            console.log(
                `Created: ${profile.name} | ${profile.role}`
            );

            insertedCount++;
        }

        console.log("\n========== SEED COMPLETE ==========");
        console.log(`Inserted : ${insertedCount}`);
        console.log(`Skipped  : ${skippedCount}`);
        console.log(`Total    : ${profiles.length}`);
        console.log("===================================\n");

    } catch (error) {

        console.error("\nError while seeding users:");
        console.error(error);

    } finally {

        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
    }
};

seedUsers();
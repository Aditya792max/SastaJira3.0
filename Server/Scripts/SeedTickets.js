const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");

dotenv.config({
    path: path.join(__dirname, "../.env")
});

const User = require("../Models/UserModel");
const Ticket = require("../Models/TicketModel");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the Environment");
}

const ticketsPath = path.join(
    __dirname,
    "../Scripts/tickets.json"
);

const seedTickets = async () => {
    try {

        // Read tickets JSON
        const ticketsData = fs.readFileSync(
            ticketsPath,
            "utf-8"
        );

        const tickets = JSON.parse(ticketsData);

        if (!Array.isArray(tickets)) {
            throw new Error(
                "tickets.json must contain an array of tickets"
            );
        }

        console.log(`Found ${tickets.length} tickets`);


        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);

        console.log(
            "Connected to MongoDB successfully..."
        );


        // Fetch all existing users
        const users = await User.find()
            .select("_id name email role")
            .lean();

        if (users.length === 0) {
            throw new Error(
                "No users found. Please run SeedUsers.js first."
            );
        }

        console.log(
            `Found ${users.length} users`
        );


        // Create a quick lookup map
        // MongoDB ObjectId -> User
        const userMap = new Map(
            users.map(user => [
                String(user._id),
                user
            ])
        );


        let insertedCount = 0;
        let skippedCount = 0;


        // Loop through all tickets
        for (const ticketData of tickets) {

            // ==========================================
            // Validate Reporter
            // ==========================================

            const reporter = userMap.get(
                String(ticketData.reporter)
            );

            if (!reporter) {

                console.log(
                    `Skipping "${ticketData.title}" - Reporter ${ticketData.reporter} not found`
                );

                skippedCount++;

                continue;
            }


            // ==========================================
            // Validate Assignee
            // ==========================================

            let assignee = null;

            if (ticketData.assignee) {

                assignee = userMap.get(
                    String(ticketData.assignee)
                );

                if (!assignee) {

                    console.log(
                        `Skipping "${ticketData.title}" - Assignee ${ticketData.assignee} not found`
                    );

                    skippedCount++;

                    continue;
                }
            }


            // ==========================================
            // Check Duplicate Ticket
            // ==========================================

            const existingTicket = await Ticket.findOne({
                title: ticketData.title
            });

            if (existingTicket) {

                console.log(
                    `Skipping "${ticketData.title}" - Ticket already exists`
                );

                skippedCount++;

                continue;
            }


            // ==========================================
            // Create Ticket
            // ==========================================

            const ticket = new Ticket({

                title: ticketData.title,

                description: ticketData.description,

                status: ticketData.status,

                priority: ticketData.priority,

                reporter: reporter._id,

                assignee: assignee
                    ? assignee._id
                    : undefined,

                comments: [],

                createdAt: ticketData.createdAt
                    ? new Date(ticketData.createdAt)
                    : undefined,

                updatedAt: ticketData.updatedAt
                    ? new Date(ticketData.updatedAt)
                    : undefined

            });


            // ==========================================
            // Save Ticket
            // ==========================================

            await ticket.save();


            console.log(
                `Created: ${ticket.title} | Reporter: ${reporter.email} | Assignee: ${
                    assignee
                        ? assignee.email
                        : "Unassigned"
                }`
            );


            insertedCount++;
        }


        // ==========================================
        // Final Summary
        // ==========================================

        console.log(
            "\n========== TICKET SEED COMPLETE =========="
        );

        console.log(
            `Inserted : ${insertedCount}`
        );

        console.log(
            `Skipped  : ${skippedCount}`
        );

        console.log(
            `Total    : ${tickets.length}`
        );

        console.log(
            "===========================================\n"
        );


    } catch (error) {

        console.error(
            "\nError while seeding tickets:"
        );

        console.error(error);


    } finally {

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed."
        );
    }
};


seedTickets();
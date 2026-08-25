const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

const Comment = require("../Models/CommentModel");
const Ticket = require("../Models/TicketModel");
const User = require("../Models/UserModel");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("MONGO_URI / MONGODB_URI is not set in .env");
}

const COMMENTS_PER_TICKET = 10;
const TOTAL_TICKETS = 100;

const commentTexts = [
    "I have started looking into this issue.",
    "I was able to reproduce the issue locally.",
    "This looks related to the current workflow.",
    "I am checking the logs and backend behavior.",
    "The issue has been investigated further.",
    "I have added more details to the ticket.",
    "This should be tested again after the latest changes.",
    "The current implementation needs a small adjustment.",
    "I have verified the behavior from my side.",
    "This looks good after the latest update."
];

const seedComments = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("Connected to MongoDB successfully...");

        // Get first 100 tickets
        const tickets = await Ticket.find()
            .sort({ createdAt: 1 })
            .limit(TOTAL_TICKETS);

        if (tickets.length === 0) {
            throw new Error(
                "No tickets found. Please seed tickets first."
            );
        }

        console.log(`Found ${tickets.length} tickets.`);


        // Get users who will become comment authors
        const users = await User.find()
            .select("_id")
            .limit(100);

        if (users.length === 0) {
            throw new Error(
                "No users found. Please seed users first."
            );
        }

        console.log(`Found ${users.length} users.`);


        // ------------------------------------------------
        // Clear existing comments from selected tickets
        // ------------------------------------------------

        await Ticket.updateMany(
            {
                _id: {
                    $in: tickets.map(ticket => ticket._id)
                }
            },
            {
                $set: {
                    comments: []
                }
            }
        );


        // ------------------------------------------------
        // Delete existing comments
        // ------------------------------------------------

        await Comment.deleteMany({});

        console.log("Existing comments cleared.");


        // ------------------------------------------------
        // Prepare 10 comments for every ticket
        // ------------------------------------------------

        const commentsToInsert = [];

        tickets.forEach((ticket, ticketIndex) => {

            for (let i = 0; i < COMMENTS_PER_TICKET; i++) {

                commentsToInsert.push({

                    // Rotate through available users
                    author:
                        users[
                            (ticketIndex * COMMENTS_PER_TICKET + i)
                            % users.length
                        ]._id,

                    text: commentTexts[i],

                    createdAt: new Date(
                        ticket.createdAt.getTime()
                        + (i + 1) * 60 * 60 * 1000
                    )
                });
            }
        });


        // ------------------------------------------------
        // Insert all comments
        // ------------------------------------------------

        const insertedComments =
            await Comment.insertMany(commentsToInsert);

        console.log(
            `${insertedComments.length} comments inserted.`
        );


        // ------------------------------------------------
        // Group comments by ticket
        // ------------------------------------------------

        const commentsByTicket = new Map();

        insertedComments.forEach((comment, index) => {

            const ticketIndex =
                Math.floor(
                    index / COMMENTS_PER_TICKET
                );

            const ticketId =
                String(tickets[ticketIndex]._id);


            if (!commentsByTicket.has(ticketId)) {
                commentsByTicket.set(ticketId, []);
            }


            commentsByTicket
                .get(ticketId)
                .push(comment._id);
        });


        // ------------------------------------------------
        // Add comment IDs to their respective tickets
        // ------------------------------------------------

        for (const ticket of tickets) {

            const commentIds =
                commentsByTicket.get(
                    String(ticket._id)
                ) || [];


            await Ticket.findByIdAndUpdate(
                ticket._id,
                {
                    $set: {
                        comments: commentIds
                    }
                }
            );
        }


        console.log(
            `Successfully seeded ${insertedComments.length} comments across ${tickets.length} tickets.`
        );


        // ------------------------------------------------
        // Validation
        // ------------------------------------------------

        const expectedComments =
            tickets.length * COMMENTS_PER_TICKET;


        if (insertedComments.length === expectedComments) {

            console.log(
                `Validation successful: ${tickets.length} tickets × ${COMMENTS_PER_TICKET} comments = ${expectedComments} comments.`
            );

        } else {

            console.log(
                `Warning: Expected ${expectedComments} comments but inserted ${insertedComments.length}.`
            );
        }

    } catch (err) {

        console.error(
            "Error seeding comments:",
            err
        );

    } finally {

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed."
        );
    }
};


seedComments();
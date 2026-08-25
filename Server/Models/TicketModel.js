const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    status: {
        type: String,
        enum: ["open", "in progress", "closed"],
        default: "open",
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


// Update updatedAt whenever ticket is saved
TicketSchema.pre("save", function () {
    this.updatedAt = Date.now();
});


const Ticket = mongoose.model("Ticket", TicketSchema);

module.exports = Ticket;
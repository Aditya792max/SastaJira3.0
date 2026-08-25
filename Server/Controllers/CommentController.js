const Comment = require("../Models/CommentModel");
const Ticket = require("../Models/TicketModel");


// ===============================
// CREATE COMMENT
// ===============================
exports.createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { ticketId } = req.params;

        if (!text) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const comment = new Comment({
            author: req.user._id,
            text
        });

        await comment.save();

        ticket.comments.push(comment._id);

        await ticket.save();

        await comment.populate("author", "-password");

        return res.status(201).json(comment);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// GET ALL COMMENTS FOR A TICKET
// ===============================
exports.getComments = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const comments = await Comment.find({
            _id: { $in: ticket.comments }
        })
            .populate("author", "-password")
            .sort({ createdAt: 1 });

        return res.json(comments);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};



// ===============================
// GET SINGLE COMMENT
// ===============================
exports.getComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate("author", "-password");

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        return res.json(comment);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// UPDATE COMMENT
// ===============================
exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        const uid = String(req.user._id);

        const isAuthor = String(comment.author) === uid;
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                message: "Not allowed to update this comment"
            });
        }

        if (text !== undefined) {
            if (!text.trim()) {
                return res.status(400).json({
                    message: "Comment text cannot be empty"
                });
            }

            comment.text = text.trim();
        }

        await comment.save();

        await comment.populate("author", "-password");

        return res.json(comment);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ===============================
// DELETE COMMENT
// ===============================
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        const uid = String(req.user._id);

        const isAuthor = String(comment.author) === uid;
        const isAdmin = req.user.role === "admin";

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({
                message: "Not allowed to delete this comment"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        // Remove comment reference from every ticket
        await Ticket.updateMany(
            { comments: comment._id },
            { $pull: { comments: comment._id } }
        );

        return res.json({
            message: "Comment deleted successfully"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ===============================
// GET ALL COMMENTS FROM ALL TICKETS
// ===============================
exports.getAllComments = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .select("_id title comments")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "-password"
                }
            });

        const allComments = [];

        tickets.forEach(ticket => {
            ticket.comments.forEach(comment => {
                allComments.push({
                    ticketId: ticket._id,
                    ticketTitle: ticket.title,
                    comment
                });
            });
        });

        return res.json(allComments);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
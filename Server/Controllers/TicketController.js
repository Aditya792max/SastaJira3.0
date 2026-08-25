const Ticket = require("../Models/TicketModel");

exports.createTicket = async (req, res) => {
    try {
        const {
            title,
            description,
            assignee,
            priority
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const ticket = new Ticket({
            title,
            description,
            reporter: req.user._id,
            assignee,
            priority
        });

        await ticket.save();

        return res.status(201).json(ticket);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


exports.getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("reporter", "-password")
            .populate("assignee", "-password")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "-password"
                }
            });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        return res.json(ticket);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


exports.updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const uid = String(req.user._id);

        const isReporter = String(ticket.reporter) === uid;
        const isAssignee =
            ticket.assignee &&
            String(ticket.assignee) === uid;

        const isAdmin = req.user.role === "admin";

        if (!isReporter && !isAssignee && !isAdmin) {
            return res.status(403).json({
                message: "Not allowed to update"
            });
        }

        const {
            title,
            description,
            status,
            priority,
            assignee
        } = req.body;

        if (title !== undefined) {
            ticket.title = title;
        }

        if (description !== undefined) {
            ticket.description = description;
        }

        if (status !== undefined) {
            ticket.status = status;
        }

        if (priority !== undefined) {
            ticket.priority = priority;
        }

        if (assignee !== undefined) {
            ticket.assignee = assignee;
        }

        await ticket.save();

        return res.json(ticket);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Only admin can delete"
            });
        }

        await Ticket.findByIdAndDelete(req.params.id);

        return res.json({
            message: "Ticket deleted successfully"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


exports.listTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate("reporter", "-password")
            .populate("assignee", "-password")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "-password"
                }
            });

        return res.json(tickets);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Server error"
        });
    }
};
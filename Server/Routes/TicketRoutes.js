const express = require("express");
const router = express.Router();

const TicketController = require("../Controllers/TicketController");
const authenticate = require("../Middlewares/AuthMiddlewares");


// Create a new ticket
router.post(
    "/create",
    authenticate,
    TicketController.createTicket
);


// Get all tickets
router.get(
    "/",
    authenticate,
    TicketController.listTickets
);


// Get a single ticket
router.get(
    "/:id",
    authenticate,
    TicketController.getTicket
);


// Update a ticket
router.put(
    "/:id",
    authenticate,
    TicketController.updateTicket
);


// Delete a ticket
router.delete(
    "/:id",
    authenticate,
    TicketController.deleteTicket
);


module.exports = router;
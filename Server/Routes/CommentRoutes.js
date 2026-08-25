const express = require("express");
const router = express.Router();

const commentController = require("../Controllers/CommentController");
const authMiddleware = require("../Middlewares/AuthMiddlewares");


// Create comment for a ticket
router.post(
    "/tickets/:ticketId/comments",
    authMiddleware,
    commentController.createComment
);


// Get all comments of a ticket
router.get(
    "/tickets/:ticketId/comments",
    authMiddleware,
    commentController.getComments
);


// Get single comment
router.get(
    "/comments/:id",
    authMiddleware,
    commentController.getComment
);


// Update comment
router.put(
    "/comments/:id",
    authMiddleware,
    commentController.updateComment
);


// Delete comment
router.delete(
    "/comments/:id",
    authMiddleware,
    commentController.deleteComment
);

router.get(
    "/allComments",
    commentController.getAllComments
);


module.exports = router;
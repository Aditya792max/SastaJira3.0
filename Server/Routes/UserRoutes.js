const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const authenticate = require("../Middlewares/AuthMiddlewares");

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/get', authenticate,UserController.getUser);

module.exports = router;
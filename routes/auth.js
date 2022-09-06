const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
const autController = require("../controllers/auth")
router.get('/login',autController.getLogin);
router.post('/login',autController.postLogin);
router.post('/logout',autController.postLogout);
router.post('/signup',autController.postSignup);
router.get('/signup',autController.getSignup);
module.exports = router;

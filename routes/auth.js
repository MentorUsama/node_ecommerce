const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();
const autController = require("../controllers/auth")
router.get('/login',autController.getLogin);
router.post('/login',autController.postLogin);
router.post('/logout',autController.postLogout);
module.exports = router;

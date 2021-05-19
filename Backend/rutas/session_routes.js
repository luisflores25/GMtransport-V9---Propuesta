'use strict'

var express = require('express');
var UserControllerSession= require('../controllers/userSession');

var router = express.Router();

router.post('/login',UserControllerSession.login);
router.get('/auth',UserControllerSession.auth);
router.get('/logout',UserControllerSession.logout);

module.exports = router;
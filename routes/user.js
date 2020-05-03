const express = require('express');
const router = express.Router();

// bring runValidation middleware from validators/index.js
const { runValidation } = require('../validators');
// bring validation functions now
const { userUpdateValidator } = require('../validators/user');

// express middleware to grab the user from the token
const { requireSignIn, adminMiddleware } = require('../controllers/auth.controller');

//  import controller methods
const { read, update} = require('../controllers/user.controller');
router.get('/user/:id', requireSignIn, read);
router.put('/user', requireSignIn, userUpdateValidator, runValidation, update);
router.put('/admin', requireSignIn, adminMiddleware, userUpdateValidator, runValidation, update);

module.exports = router;
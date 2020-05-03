const express = require('express');
const router = express.Router();

//  import controller methods
const { signup, accountActivation, signin, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// bring runValidation middleware from validators/index.js
const { runValidation } = require('../validators');
// bring validation functions now
const {
      userSignupValidator,
      userSignInValidator,
      forgotPasswordValidator,
      resetPasswordValidator
    } = require('../validators/auth');


router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation)
router.post('/signin', userSignInValidator, runValidation, signin)
router.post('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword )

module.exports = router;
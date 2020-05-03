const { check } = require('express-validator');
exports.userSignupValidator = [
  //check name
  check('name').not().isEmpty().withMessage('Name is required'),
  // check username
  check('email').isEmail().withMessage('Valid email address is required'),
  //password
  check('password').isLength({ min: 6 }).withMessage('Password is required and must be at least 6 chars long'),
]

exports.userSignInValidator = [
  // check email
  check('email').isEmail().withMessage('Valid email address is required'),
  // password
  check('password').isLength({ min: 6 }).withMessage('Password is required and must be at least 6 chars long'),

];

exports.forgotPasswordValidator = [
   // check email
   check('email').isEmail().withMessage('Valid email address is required')
]

exports.resetPasswordValidator = [
  // check password
  check('newpassword').isLength({ min: 6 }).withMessage('New password is required and must be at least 6 chars long'),
]
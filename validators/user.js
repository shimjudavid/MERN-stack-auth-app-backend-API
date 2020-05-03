const { check } = require('express-validator');
exports.userUpdateValidator = [
  //check name
  check('name').not().isEmpty().withMessage('Name is required'),
  //password
  check('password').isLength({ min: 6 }).withMessage('Password is required and must be at least 6 chars long'),
]

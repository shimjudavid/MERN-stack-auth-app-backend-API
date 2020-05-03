const mongoose = require('mongoose');

// we needed crypto to hash the plain password to hashed one before storing into DB
// note that this is a core node.js module - https://nodejs.org/api/crypto.html
const crypto = require('crypto');

// user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    max : 32
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true
  },

  hashed_password: {
    type: String,
    required: true
  },

  salt: String,

  role: {
    type: String,
    default: 'subscriber'
  },

  resetPasswordLink: {
    data: String,
    default: ''
  }


}, {timestamps: true});


// virtual fields
    // here we take the normal password posted by user, hash it and then save that in hashed_password field
userSchema.virtual('password')
  .set(function (password) {

    // create a temp variable to store the original password by the user
    this.temp_password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this.temp_password;
  })


// methods
userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) {
      return ''
    }
    try {
      return crypto.createHmac('sha1', this.salt)
      .update(password)
      .digest('hex');
    }
    catch (error) {
      return ''
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },

  // this method will take the plain password, hash it and compare with hashed one stored in db
  // and if they match we can authenticate the user
  authenticate: function (plain_password) {
    if (!plain_password) return false;
    return this.encryptPassword(plain_password) === this.hashed_password;
  },

}

module.exports = mongoose.model('User', userSchema );
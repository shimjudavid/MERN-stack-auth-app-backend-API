const User = require('../models/user')
const jwt = require('jsonwebtoken')
const sendgrid = require('@sendgrid/mail')
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const expressJWT = require('express-jwt')

exports.signup = async(req, res) => {

  const { name, email, password } = req.body;
  // check email exists in db or not
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email is already taken' })
    }
  }
  catch (error) {
    return res.status(400).json({ error: error})
  }

/*
  jwt.sign function takes the payload, secret and options as its arguments.
  The payload can be used to find out which user is the owner of the token.
  Options can have an expire time until which token is valid. The generated token will be a string.
  We are then sending the generated token back to the client in the response body.
  The client should preserve this token for future requests.
*/

  const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '10m'})

  //send email

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Account activation link`,
    html: `
    <h2> Please click on the following link to activate your account  </h2>
    <p> ${process.env.CLIENT_URL}/auth/activate/${token}</p>
    <hr/>
    <p> This email may contain sensitive information</p>
    <p>${process.env.CLIENT_URL}</p>
    `

  }
  try {
    await sendgrid.send(emailData);
    console.log('Signup mail sent')
    return res.status(200).json({message: `email has been sent to ${email} for account activation`})
  }
  catch (error) {
    return res.status(400).json({ error: error });
  }

}

exports.accountActivation = async(req, res) => {
  // grab token first
  const { token } = req.body;
  // need to check the token is expired or not (it has a =n expiry of 10 min)
  if (token) {
    try {
      await jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION)
    }
    catch (error) {
      console.log('JWT verify in account activation error', error);
      return res.status(401).json({
        error: 'Expired link. Please signup again'
      })
    }

    try {
      const { name, email, password } = await jwt.decode(token)
      const new_user = new User({ name, email, password });
      await new_user.save();
      return res.status(200).json({ message: `Signup success. Please sign in.` })

    }
    catch (error) {
      console.log('Save user in account activation error', error);
      return res.status(400).json({
        error: 'Error saving user. Please try to signup again'
      })
    }


  }
  else {
    return res.status(400).json({
      error: 'Error!!. Please check your confirmation link as it seems wrong'
    })
  }

}

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "User with the provided email does not exist, please sign up" });
  }

  // authenticate the user, you can find this method in User model

    if (!user.authenticate(password)) {
      return res.status(400).json({ success: 'false', error: "Email and password does not match" });
    }

  //generate a signed JWT token using user id and send to the client
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });


  // finally we want to return the json response with user info and token, so that our client
  // can store the token some where and also store the user info, so next time when they make the request
  // to the backend api they can send the token as well, and api can validate and authenticate the user

  const { _id, name, role } = user;
  return res.json({ token, user:{ _id, name, email, role } });

}


// forgot password

exports.forgotPassword = async (req, res) => {
  //first get the password from req.body
  const { email } = req.body;
  // now we need to check any user with email exists or not

  try {
    const user = await User.findOne({ email });
    // now we got the user, we need to generate password reset link based on JWT Token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'})


    // finally send an email with the password reset link

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Password Reset link`,
    html: `
    <h2> Please click on the following link to reset your password  </h2>
    <p> ${process.env.CLIENT_URL}/reset-password/${token}</p>
    <hr/>
    <p> This email may contain sensitive information</p>
    <p>${process.env.CLIENT_URL}</p>
    `
  }
  try {
    await sendgrid.send(emailData);
    console.log('Forgot Password mail sent')
    return res.status(200).json({message: `Forgot password link has been sent to ${email} to rest your new password`})
  }
  catch (error) {
    return res.status(400).json({ error: error });
  }


  }
  catch (error) {
    return res.status(400).json({ error: "User with the provided email does not exist, please sign up" });
  }


}

// Reset Password

exports.resetPassword = async (req, res) => {
    // grab token and new password first
  const { token, newpassword } = req.body;
  // need to check the token is expired or not (it has an expiry of 10 min)

// need to check the token is expired or not (it has an expiry of 10 min)
  if (token) {
    try {
      await jwt.verify(token, process.env.JWT_RESET_PASSWORD)
    }
    catch (error) {
      console.log('JWT verify in forgot password error', error);
      return res.status(401).json({
        error: 'Password reset link is expired. Please try again'
      })
    }

    try {
      const { _id } = await jwt.decode(token)
      const user = await User.findById(_id);
      user.password = newpassword;
      await user.save();
      return res.status(200).json({ message: `Your password has been reset successfully. Please sign in.` })

    }
    catch (error) {
      console.log('Password resetting error', error);
      return res.status(400).json({
        error: 'Error resetting new password. Please try again'
      })
    }

  }
  else {
    return res.status(400).json({
      error: 'Error!!. Please check your password reset link as it seems wrong'
    })
  }



}


/*
Now this middleware requireSignI checks for JSON Web Token(JWT) by comparing the JWT Secret
and also it checks the expiry of the token and if both verified and is correct,
will make available the  decoded payload which is  _id (user'id)
 in the request object as req.user by default on any controller method
 who's route we are injecting this middleware to. Hence the id will be available as req.user._id
(Note that _id is what we used to originally generate this JWT token during the SignIn process)
*/

exports.requireSignIn = expressJWT({
  secret: process.env.JWT_SECRET
})

// This middleware will make use of requireSignin middleware which will return userid in request obkect
// and from the user id we can determine user role and check if that role is admin and if
//admin only we can allow to access the endpoints
exports.adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json('User not found');
      next();
    }
    else {
      // get the user role
      const { role } = user;
      if (role === "admin") {
        user.salt = undefined;
        user.hashed_password = undefined;
        req.profile = user;
        next();
      }
      else {
        return res.status(400).json('Access denied. It is accessible to admin users only');
        next();
      }
    }

  }
  catch (error) {
    return res.status(400).json({ error: error })
    next();
  }



}
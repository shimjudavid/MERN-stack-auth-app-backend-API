const User = require('../models/user')

exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (user) {
      // we don't want to return Salt and hashed Password as response
      user.salt = undefined;
      user.hashed_password = undefined;
      return res.status(200).json({user});
    }
  }
  catch (error) {
    return res.status(400).json({ error: 'User not found'})
  }

}

exports.update = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json('User not found');
    }
    else {
      user.name = name;
      user.password = password;
      const updated = await user.save();
      updated.salt = undefined;
      updated.hashed_password = undefined;
      updated.createdAt = undefined;
      updated.updatedAt = undefined;
      return res.status(200).json({user: updated});
    }
  }
  catch (error) {
    return res.status(400).json({ error: error})
  }

}
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Error('Invalid Credentials');
  }
  // compare password
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, token });
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');
    res.status(StatusCodes.OK).json(user);
}

const updateUser = async (req, res) => {
  const { name, email, bio, location, website, avatar } = req.body;

  if (!name || !email) {
    throw new Error('Please provide name and email');
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.name = name;
  user.email = email;
  user.bio = bio;
  user.location = location;
  user.website = website;
  user.avatar = avatar;

  await user.save();

  res.status(StatusCodes.OK).json({ user });
};

module.exports = {
  register,
  login,
  getMe,
  updateUser,
};

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Authentication invalid');
    error.statusCode = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const authError = new Error('Authentication invalid');
    authError.statusCode = StatusCodes.UNAUTHORIZED;
    return next(authError);
  }

  req.user = { userId: payload.userId, name: payload.name };
  next();
};

module.exports = auth;

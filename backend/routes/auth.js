const express = require('express');
const router = express.Router();
const { register, login, getMe, updateUser } = require('../controllers/auth');
const auth = require('../middlewares/authentication');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.patch('/updateUser', auth, updateUser);

module.exports = router;


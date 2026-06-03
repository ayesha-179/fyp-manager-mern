const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  updateEmail,
  changePassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/update-email', protect, updateEmail);
router.put('/change-password', protect, changePassword);

module.exports = router;
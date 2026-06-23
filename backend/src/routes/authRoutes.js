const express = require('express');
const router = express.Router();
const { verifyAndLogin, getMe, updateMe, getMyReviews } = require('../controllers/authController');
const { protectUser } = require('../middleware/authUser');

router.post('/verify', verifyAndLogin);
router.get('/me', protectUser, getMe);
router.put('/me', protectUser, updateMe);
router.get('/reviews', protectUser, getMyReviews);

module.exports = router;


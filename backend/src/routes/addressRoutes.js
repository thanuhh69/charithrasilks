const express = require('express');
const router = express.Router();
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { protectUser } = require('../middleware/authUser');

router.use(protectUser);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);

module.exports = router;

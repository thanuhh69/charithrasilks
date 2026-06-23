// @desc    Get all addresses for current user
// @route   GET /api/addresses
const getAddresses = async (req, res) => {
  res.json({ success: true, addresses: req.user.addresses });
};

// @desc    Add new address
// @route   POST /api/addresses
const addAddress = async (req, res) => {
  try {
    const { label, fullName, mobile, addressLine, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      req.user.addresses.forEach((a) => (a.isDefault = false));
    }
    // If this is the first address, make it default automatically
    const makeDefault = isDefault || req.user.addresses.length === 0;

    req.user.addresses.push({
      label,
      fullName,
      mobile,
      addressLine,
      city,
      state,
      pincode,
      isDefault: makeDefault,
    });

    await req.user.save();
    res.status(201).json({ success: true, addresses: req.user.addresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update an address
// @route   PUT /api/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const address = req.user.addresses.find((a) => a._id.toString() === req.params.addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const { label, fullName, mobile, addressLine, city, state, pincode, isDefault } = req.body;
    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (mobile !== undefined) address.mobile = mobile;
    if (addressLine !== undefined) address.addressLine = addressLine;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;

    if (isDefault) {
      req.user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    await req.user.save();
    res.json({ success: true, addresses: req.user.addresses });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    req.user.addresses = req.user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await req.user.save();
    res.json({ success: true, addresses: req.user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };

const Razorpay = require('razorpay');

let instance = null;

function getRazorpayInstance() {
  if (instance) return instance;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('[Razorpay] Keys not configured. Online payments via Razorpay will not work until you add them to .env');
    return null;
  }

  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
}

module.exports = { getRazorpayInstance };

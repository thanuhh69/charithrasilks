const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  try {
    let serviceAccount;

    // Option 1: Path to JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const fullPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(fullPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      }
    }

    // Option 2: JSON string directly in env var FIREBASE_SERVICE_ACCOUNT_JSON
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }

    if (!serviceAccount) {
      console.warn(
        '[Firebase] No service account found. OTP / Google login verification will not work until you add firebase-service-account.json. See README.'
      );
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log('[Firebase] Admin SDK initialized successfully.');
    return admin;
  } catch (err) {
    console.error('[Firebase] Failed to initialize:', err.message);
    return null;
  }
}

module.exports = { initFirebase, admin };

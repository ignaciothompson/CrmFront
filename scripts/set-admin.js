// scripts/set-admin.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const uid = process.argv[2]; // pass UID as first arg
if (!uid) {
  console.error('Usage: node scripts/set-admin.js <UID>');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' })
  .then(() => {
    console.log(`Admin claims set for ${uid}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
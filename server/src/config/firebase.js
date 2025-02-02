var admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config(); // Incarca variabilele din .env

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Transformă `\n` în newline
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Export auth pentru autentificare si db pentru baza de date Firestore
const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
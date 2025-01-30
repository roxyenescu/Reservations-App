import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAsyDCBYzTiMFKXAZ_OmfKkh2SuMpSMW34",
    authDomain: "reservations-app-ffac5.firebaseapp.com",
    projectId: "reservations-app-ffac5",
    storageBucket: "reservations-app-ffac5.firebasestorage.app",
    messagingSenderId: "203606210052",
    appId: "1:203606210052:web:a849c2b1be1c107475a751",
    measurementId: "G-HKBKSDQ89T"
};

// Initializare Firebase
const app = initializeApp(firebaseConfig);

// Initializare autentificare
const auth = getAuth(app);

console.log("Firebase App initialized:", app);

export { auth };
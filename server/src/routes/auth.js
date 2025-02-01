const express = require("express");
const { auth } = require("../config/firebase");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Inregistrare utilizator
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRecord = await auth.createUser({
            email,
            password
        });
        res.status(201).json({ message: "Utilizator creat!", userId: userRecord.uid });
    } catch (error) {
        res.status(500).json({ error: "Eroare la inregistrare!", details: error.message });
    }
});

// Autentificare utilizator
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.getUserByEmail(email);

        res.status(200).json({ 
            message: "Autentificare reusita!", 
            userId: user.uid,
        });
    } catch (error) {
        res.status(401).json({ error: "Eroare la autentificare!", details: error.message });
    }
});

// Logout 
// -> in frontend se sterge token-ul
// -> doar utilizatorii autentificati pot face Logout
router.post("/logout", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Deconectare reusita!" });
});

module.exports = router;

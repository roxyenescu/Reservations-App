const express = require("express");
const { db } = require("../config/firebase");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Adaugarea unei rezervari (protejat)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;
        
        const docRef = await db.collection("reservations").add({
            userId: req.user.uid, // Asociez rezervarea cu utilizatorul autenticat
            name,
            date,
            time,
            table,
            peopleCount,
            phoneNumber,
            createdAt: new Date().toISOString(),
        });
        
        res.status(201).json({ id: docRef.id, message: "Rezervare adaugata!" });
    } catch (error) {
        res.status(500).json({ error:"Eroare la adaugarea rezervarii!", details: error });
    }
});

// Obtinerea tuturor rezervarilor (protejat)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("reservations").where("userId", "==", req.user.uid).get();
        const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea rezervarilor!", details: error });
    }
});

// Actualizarea unei rezervari (protejat)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;

        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists || doc.data().userId !== req.user.uid) {
            return res.status(404).json({ error: "Rezervarea nu a fost gasita sau nu apartine utilizatorului!" });
        }

        await reservationRef.update({
            name, 
            date, 
            time,
            table,
            peopleCount,
            phoneNumber,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).json({ message: "Rezervare actualizata!"});
    } catch(error) {
        res.status(500).json({error: "Eroare la actualizarea rezervarii!", details: error });
    }
});

// Stergerea unei rezervari (protejat)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists || doc.data().userId !== req.user.uid) {
            return res.status(404).json({ error: "Rezervarea nu a fost gasita sau nu apartine utilizatorului!" });
        }

        await reservationRef.delete();

        res.status(200).json({ message: "Rezervare stearsa!" });

    } catch (error) {
        res.status(500).json({ error: "Eroare la stergerea rezervarii!", details: error });
    }
});

module.exports = router;
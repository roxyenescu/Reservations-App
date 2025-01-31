const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// Adaugarea unei rezervari
router.post("/", async (req, res) => {
    try {
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;
        const docRef = await db.collection("reservations").add({
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

// Obtinerea tuturor rezervarilor
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("reservations").get();
        const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea rezervarilor!", details: error });
    }
});

// Actualizarea unei rezervari
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;

        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Rezervarea nu a fost gasita!" });
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

// Stergerea unei rezervari
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Rezervarea nu a fost gasita!" });
        }

        await reservationRef.delete();

        res.status(200).json({ message: "Rezervare stearsa!" });

    } catch (error) {
        res.status(500).json({ error: "Eroare la stergerea rezervarii!", details: error });
    }
});

module.exports = router;
const express = require("express");
const { db } = require("../config/firebase");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Adaugarea unei mese (protejat)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { tableNumber, seats } = req.body;

        // Validare: Numarul mesei trebuie sa fie un numar pozitiv
        if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
            return res.status(400).json({ error: "Numarul mesei trebuie sa fie un numar pozitiv!" });
        }

        // Validare: Numarul de locuri trebuie sa fie intre 1 si 200
        if (!Number.isInteger(seats) || seats < 1 || seats > 200) {
            return res.status(400).json({ error: "Numarul de locuri trebuie sa fie intre 1 si 200!" });
        }

        // Verific daca exista deja aceasta masa
        const existingTables = await db.collection("tables")
            .where("tableNumber", "==", tableNumber)
            .get();

        if (!existingTables.empty) {
            return res.status(400).json({ error: "Aceasta masa exista deja!" });
        }

        const docRef = await db.collection("tables").add({
            tableNumber,
            seats,
            createdBy: req.user.uid, // Adaug ID-ul utilizatorului care a creat masa
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({ id: docRef.id, message: "Masa a fost adaugata!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la adaugarea mesei!", details: error });
    }
});

// Obtinerea tuturor meselor (protejat)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("tables").get();
        const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea meselor!", details: error });
    }
});

// Stergerea unei mese (protejat)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const tableRef = db.collection("tables").doc(id);
        const doc = await tableRef.get();

        if (!doc.exists || doc.data().createdBy !== req.user.uid) {
            return res.status(404).json({ error: "Masa nu a fost gasita sau nu apartine utilizatorului!" });
        }

        await tableRef.delete();

        res.status(200).json({ message: "Masa a fost stearsa!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la stergerea mesei!", details: error });
    }
});

module.exports = router;
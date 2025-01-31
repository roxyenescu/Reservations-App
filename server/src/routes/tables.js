const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// Adaugarea unei mese
router.post("/", async (req, res) => {
    try {
        const { tableNumber, seats } = req.body;

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
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({ id: docRef.id, message: "Masa a fost adaugata!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la adaugarea mesei!", details: error });
    }
});

// Obtinerea tuturor meselor
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("tables").get();
        const tables = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea meselor!", details: error });
    }
});

// Actualizarea unei mese
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { tableNumber, seats } = req.body;

        const tableRef = db.collection("tables").doc(id);
        const doc = await tableRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Masa nu a fost gasita!" });
        }

        await tableRef.update({
            tableNumber,
            seats,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).json({ message: "Masa a fost actualizata!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la actualizarea mesei!", details: error });
    }
});

// Stergerea unei mese
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tableRef = db.collection("tables").doc(id);
        const doc = await tableRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Masa nu a fost gasita!" });
        }

        await tableRef.delete();

        res.status(200).json({ message: "Masa a fost stearsa!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la stergerea mesei!", details: error });
    }
});

module.exports = router;
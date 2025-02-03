const express = require("express");
const { db } = require("../config/firebase");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Functie pentru validarea numelui (doar litere si spatii)
const isValidName = (name) => /^[A-Za-z\s]+$/.test(name);

// Functie pentru validarea numarului de telefon (exact 10 cifre)
const isValidPhoneNumber = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);

// Functie pentru verificarea capacitatii mesei
const isPeopleCountValid = async (table, peopleCount) => {
    const snapshot = await db.collection("tables").where("tableNumber", "==", table).get();
    if (snapshot.empty) return false;

    const tableData = snapshot.docs[0].data();
    return peopleCount <= tableData.seats;
};

// Functie pentru verificarea existentei rezervarilor duplicate
const isDuplicateReservation = async (table, date, time) => {
    const snapshot = await db.collection("reservations")
        .where("table", "==", table)
        .where("date", "==", date)
        .where("time", "==", time)
        .get();

    return !snapshot.empty;
};

// Adaugarea unei rezervari (protejat)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;

        // Validări
        if (!name || !date || !time || !table || !peopleCount || !phoneNumber) {
            return res.status(400).json({ error: "Toate campurile sunt obligatorii!" });
        }

        if (!isValidName(name)) {
            return res.status(400).json({ error: "Numele trebuie sa contină doar litere si spatii!" });
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "Numarul de telefon trebuie sa contină exact 10 cifre!" });
        }

        const validCapacity = await isPeopleCountValid(table, peopleCount);
        if (!validCapacity) {
            return res.status(400).json({ error: "Numarul de persoane depaseste capacitatea mesei!" });
        }

        const duplicate = await isDuplicateReservation(table, date, time);
        if (duplicate) {
            return res.status(400).json({ error: "Aceasta masa este deja rezervata la această data si ora!" });
        }

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
        res.status(500).json({ error: "Eroare la adaugarea rezervarii!", details: error });
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

        // Verific daca rezervarea exista
        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists || doc.data().userId !== req.user.uid) {
            return res.status(404).json({ error: "Rezervarea nu a fost gasita sau nu apartine utilizatorului!" });
        }

        // Validări
        if (!name || !date || !time || !table || !peopleCount || !phoneNumber) {
            return res.status(400).json({ error: "Toate campurile sunt obligatorii!" });
        }

        if (!isValidName(name)) {
            return res.status(400).json({ error: "Numele trebuie sa contină doar litere si spatii!" });
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "Numarul de telefon trebuie sa contină exact 10 cifre!" });
        }

        const validCapacity = await isPeopleCountValid(table, peopleCount);
        if (!validCapacity) {
            return res.status(400).json({ error: "Numarul de persoane depaseste capacitatea mesei!" });
        }

        const duplicate = await isDuplicateReservation(table, date, time);
        if (duplicate) {
            return res.status(400).json({ error: "Aceasta masa este deja rezervata la această data si ora!" });
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

        res.status(200).json({ message: "Rezervare actualizata!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la actualizarea rezervarii!", details: error });
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
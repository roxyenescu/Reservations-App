const express = require("express");
const { db } = require("../config/firebase");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Functie pentru validarea numelui (doar litere si spatii)
const isValidName = (name) => /^[A-Za-z\s]+$/.test(name);

// Functie pentru validarea numarului de telefon (exact 10 cifre)
const isValidPhoneNumber = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);

// Functie pentru verificarea existentei rezervarilor duplicate
const isDuplicateReservation = async (table, date, time) => {
    const snapshot = await db.collection("reservations")
        .where("table", "==", table)
        .where("date", "==", date)
        .where("time", "==", time)
        .get();

    return !snapshot.empty;
};

// Adaugarea unei rezervari 
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;

        // Validari
        if (!name || !date || !time || !table || !peopleCount || !phoneNumber) {
            return res.status(400).json({ error: "Toate campurile sunt obligatorii!" });
        }

        if (!isValidName(name)) {
            return res.status(400).json({ error: "Numele trebuie sa contină doar litere si spatii!" });
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ error: "Numarul de telefon trebuie sa contină exact 10 cifre!" });
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
            history: [] // Vector gol pentru istoricul rezervarii
        });

        res.status(201).json({ id: docRef.id, message: "Rezervare adaugata!" });
    } catch (error) {
        res.status(500).json({ error: "Eroare la adaugarea rezervarii!", details: error });
    }
});

// Obtinerea tuturor rezervarilor 
router.get("/", authMiddleware, async (req, res) => {
    try {
        const snapshot = await db.collection("reservations").where("userId", "==", req.user.uid).get();
        const reservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea rezervarilor!", details: error });
    }
});

// Actualizarea unei rezervari
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, time, table, peopleCount, phoneNumber } = req.body;

        // Verific dacă rezervarea există
        const reservationRef = db.collection("reservations").doc(id);
        const doc = await reservationRef.get();

        if (!doc.exists || doc.data().userId !== req.user.uid) {
            return res.status(404).json({ error: "Rezervarea nu a fost găsită sau nu aparține utilizatorului!" });
        }

        const existingReservation = doc.data();

        // Eliminăm istoricul anterior din `previousState`
        const { history, ...reservationWithoutHistory } = existingReservation;

        // Construim istoricul corect (fără istoricul anterior inclus)
        const newHistoryEntry = {
            updatedAt: new Date().toISOString(),
            previousState: reservationWithoutHistory // Păstrăm doar valorile fără history
        };

        // Construim datele pentru actualizare
        const updatedData = {
            name,
            date,
            time,
            table,
            peopleCount,
            phoneNumber,
            history: existingReservation.history
                ? [...existingReservation.history, newHistoryEntry]
                : [newHistoryEntry],
            updatedAt: new Date().toISOString()
        };

        await reservationRef.update(updatedData);

        res.status(200).json({ message: "Rezervare actualizată!", updatedData });
    } catch (error) {
        console.error("Eroare la actualizarea rezervării:", error);
        res.status(500).json({ error: "Eroare la actualizarea rezervării!", details: error.message });
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

// Functie pentru a sterge rezervarile care au trecut
const deleteExpiredReservations = async () => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const snapshot = await db.collection("reservations")
            .where("date", "<", today)
            .get();

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("Rezervarile expirate au fost sterse cu succes.");
    } catch (error) {
        console.error("Eroare la ștergerea rezervarilor expirate:", error);
    }
};

// Se ruleaza stergerea automata zilnic la ora 00:00
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        deleteExpiredReservations();
    }
}, 60 * 1000); // Se verifica la fiecare minut daca s-a ajuns la miezul noptii






module.exports = router;
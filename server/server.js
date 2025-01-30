require('dotenv').config(); // Importa variabilele de mediu

const express = require('express'); // Importa express
const logger = require('./src/middlewares/logger'); // Importa middleware-ul personalizat pentru logging
const morgan = require('morgan'); // Importa morgan pentru logging

const { db } = require("./src/config/firebase"); // Importă conexiunea Firestore

const app = express(); // Creeaza aplicatia express
const PORT = process.env.PORT || 3000; // Portul este preluat din variabilele de mediu 

// Middleware-uri esentiale
app.use(express.json()); // Procesare JSON
app.use(express.urlencoded({ extended: true })); // Procesare URL-encoded
app.use(logger); // Middleware-ul personalizat pentru logging
app.use(morgan('dev')); // Middleware-ul morgan pentru logging avansat

// Rute de test
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Rută pentru a testa conexiunea la Firestore
app.get('/test-firestore', async (req, res) => {
    try {
        // Creează un document de test în Firestore
        const testDoc = await db.collection('test').add({
            message: "Hello from Firestore!",
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ success: true, docId: testDoc.id });
    } catch (error) {
        console.error("Error connecting to Firestore:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// Pornirea serverului 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
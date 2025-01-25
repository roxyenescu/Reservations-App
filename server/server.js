require('dotenv').config(); // Importa variabilele de mediu

const express = require('express'); // Importa express
const logger = require('./src/middlewares/logger'); // Importa middleware-ul personalizat pentru logging
const morgan = require('morgan'); // Importa morgan pentru logging

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

// Pornirea serverului 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
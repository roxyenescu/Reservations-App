require('dotenv').config(); // Importa variabilele de mediu

const express = require('express'); // Importa express
const cors = require("cors"); // Importa cors
const logger = require('./src/middlewares/logger'); // Importa middleware-ul personalizat pentru logging
const morgan = require('morgan'); // Importa morgan pentru logging

const { db } = require("./src/config/firebase"); // Importa conexiunea Firestore

const authRoutes = require("./src/routes/auth"); // Importa rutele autentificarii
const reservationsRoutes = require("./src/routes/reservations"); // Importa rutele rezervarilor
const tablesRoutes = require("./src/routes/tables"); // Importa rutele meselor

const app = express(); // Creeaza aplicatia express
const PORT = process.env.PORT || 3000; // Portul este preluat din variabilele de mediu 

// Middleware-uri esentiale
app.use(express.json()); // Procesare JSON
app.use(cors()); // Configurare CORS - permite cereri de la frontend
app.use(express.urlencoded({ extended: true })); // Procesare URL-encoded
app.use(logger); // Middleware-ul personalizat pentru logging
app.use(morgan('dev')); // Middleware-ul morgan pentru logging avansat

// Rutele de rezervare
app.use("/auth", authRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/tables", tablesRoutes);


// Pornirea serverului 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
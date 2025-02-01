const admin = require("firebase-admin");

// Middleware pentru verificarea autentificarii utilizatorului
const authMiddleware = async (req, res, next) => {
    try {
        // Extrag token-ul din "Bearer <TOKEN>"
        const token = req.headers.authorization?.split(" ")[1]; 

        if (!token) {
            return res.status(401).json({ error: "Acces neautorizat! Lipseste token-ul." });
        }

        // Verific si decodific token-ul
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Atasez datele utilizatorului la request
        req.user = decodedToken; 

        // Continui catre ruta urmatoare
        next(); 

    } catch (error) {
        res.status(403).json({ error: "Token invalid sau expirat!", details: error.message });
    }
};

module.exports = authMiddleware;

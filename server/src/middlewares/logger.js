/* 
-> middleware simplu care înregistrează în consola fiecare request trimis catre server
-> afiseaza metoda HTTP (GET, POST, PUT, DELETE) si URL-ul request-ului
-> apeleaza next(), permitand execuția sa continue catre urmatorul middleware sau catre ruta finala
-> ma ajuta sa vad ce request-uri sunt facute catre server
-> daca ceva nu functioneaza, pot verifica daca request-urile ajung la server
*/

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

module.exports = logger;
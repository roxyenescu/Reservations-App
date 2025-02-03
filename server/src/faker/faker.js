const { db } = require("../config/firebase");
const faker = require("@faker-js/faker").faker;
require("dotenv").config();

async function addTableToFirestore(tableNumber, seats) {
  try {
    const tableJson = {
      tableNumber: tableNumber,
      seats: seats,
      uniqueId: faker.string.uuid(), // Generează un ID unic fictiv pentru fiecare masă
    };

    await db.collection("tables").add(tableJson);
  } catch (error) {
    console.error("Error adding table document: ", error);
  }
}

async function generateTables() {
  for (let i = 1; i <= 30; i++) {
    let seats = 2; // Implicit pentru primele 10 mese
    if (i >= 11 && i <= 20) seats = 4;
    else if (i >= 21 && i <= 25) seats = 6;
    else if (i >= 26 && i <= 30) seats = 8;

    await addTableToFirestore(i, seats);
  }

  console.log("Finished generating tables");
}

generateTables();
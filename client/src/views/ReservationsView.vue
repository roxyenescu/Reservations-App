<template>
    <div class="reservations-container">
        <h1>Adauga o noua rezervare:</h1>
        <!-- Formular pentru adaugarea unei noi rezervari sau pentru editarea unei rezervari existente -->
        <form @submit.prevent="isEditing ? updateReservation() : addReservation()" class="reservation-form">
            <input type="text" v-model="newReservation.name" placeholder="Nume" @blur="validateName" required />
            <p v-if="nameError" class="error">{{ nameError }}</p>

            <input type="date" v-model="newReservation.date" :min="today" required />

            <input type="time" v-model="newReservation.time" required />

            <select v-model="newReservation.table" required>
                <option disabled value="">Alege o masa...</option>
                <option v-for="table in availableTables" :key="table.id" :value="table.name">
                    {{ table.name }}
                </option>
            </select>

            <input type="number" v-model="newReservation.peopleCount" placeholder="Numar persoane" @blur="validatePeopleCount" required />
            <p v-if="peopleError" class="error">{{ peopleError }}</p>

            <input type="text" v-model="newReservation.phoneNumber" placeholder="Telefon" @blur="validatePhone" required />
            <p v-if="phoneError" class="error">{{ phoneError }}</p>


            <!-- Butoane pentru adaugare/actualizare rezervare -->
            <div class="button-group">
                <button type="submit">{{ isEditing ? "Actualizează rezervarea" : "Adauga rezervare" }}</button>
                <button v-if="isEditing" type="button" @click="cancelEdit">Anulează editarea</button>
            </div>
        </form>

        <h2>Rezervari restaurant:</h2>

        <!-- Butoane pentru filtrare -->
        <div class="filter-buttons">
            <button @click="filterType = 'all'">Toate rezervarile</button>
            <button @click="filterType = 'today'">Rezervarile de astazi</button>
        </div>

        <!-- Camp pentru cautare -->
        <input type="text" v-model="searchQuery" placeholder="Cauta rezervare dupa nume..." class="search-bar">

        <div v-if="searchedReservations.length === 0" class="no-reservations">
            <p>Nu exista rezervari inca.</p>
        </div>

        <!-- Lista rezervarilor -->
        <ul v-else class="reservation-list">
            <li v-for="reservation in searchedReservations" :key="reservation.id">
                <span>
                    {{ reservation.name }}:
                    {{ reservation.date }} la {{ reservation.time }} |
                    {{ reservation.table }} | {{ reservation.peopleCount }} persoane
                </span>

                <!-- Container pentru butoane -->
                <div class="button-container">
                    <button class="edit-btn" @click="editReservation(reservation)">Editează</button>
                    <button class="delete-btn" @click="openModal(reservation.id)">Anuleaza</button>
                </div>
            </li>
        </ul>

        <!-- Modal pentru confirmarea stergerii -->
        <ConfirmModal :show="showModal" @confirm="confirmDelete" @close="showModal = false" />

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { auth } from "@/config/firebase"; 
import ConfirmModal from "@/components/ModalDeleteReservation.vue";

const store = useStore();

const showModal = ref(false);
const reservationToDelete = ref(null);

// Obtin data de astazi in format YYYY-MM-DD
const today = new Date().toISOString().split("T")[0];

// Accesez rezervarile
const reservations = computed(() => store.getters.allReservations);

// Initial, apar toate rezervarile
const filterType = ref("all");

// Initial, bara de cautare este goala
const searchQuery = ref("");

// Filtrare rezervari pe baza 'filterType' dupa data
const filteredReservations = computed(() => {
    let reservationsList = reservations.value;

    if (filterType.value === "today") {
        return reservations.value.filter(reservation => reservation.date === today);
    }

    return reservationsList.sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Filtrare dupa nume
// ->  Daca o rezervare nu are nume definit, ea este ignorata in cautare, evitand astfel crash-ul aplicatiei.
const searchedReservations = computed(() => {
    return filteredReservations.value.filter(reservation =>
        reservation?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Se calculeaza mesele disponibile in functie de data si ora selectata
const availableTables = computed(() => {
    if (!newReservation.value.date || !newReservation.value.time) {
         // Daca nu s-a selectat inca o data si o ora, se returneaza toate mesele
        return tables.value;
    }

    let filteredTables = tables.value.filter(table => {
        // Se verifica daca aceasta masa este deja rezervata pentru data si ora selectata
        const isTaken = reservations.value.some(reservation =>
            reservation.date === newReservation.value.date &&
            reservation.time === newReservation.value.time &&
            table.name.includes(reservation.table)
        );

        return !isTaken;
    });

    // Se adauga manual masa rezervarii in cazul in care suntem in cazul de editare
    if (isEditing.value) {
        const currentTable = tables.value.find(t => t.name === newReservation.value.table);
        if (currentTable && !filteredTables.includes(currentTable)) {
            filteredTables.push(currentTable);
        }
    }

    return filteredTables;
});


// Se deschide modalul si se stocheaza rezervarea care trebuie stearsa
const openModal = (id) => {
    reservationToDelete.value = id;
    showModal.value = true;
};

// Functie pentru a sterge o rezervare dupa confirmarea stergerii
const confirmDelete = async () => {
    if (reservationToDelete.value) {
        await store.dispatch("deleteReservation", reservationToDelete.value);
    }
    showModal.value = false;
};

const isEditing = ref(false);
const editingId = ref(null);

const newReservation = ref({
    name: "",
    date: "",
    time: "",
    table: "",
    peopleCount: "",
    phoneNumber: ""
});

// Preiau mesele din store
const tables = computed(() => store.getters.allFormatedTables);

// Se asteapta ca Firebase sa incarce utilizatorul inainte de a face request-uri (caz in care dam refresh)
const isUserAuthenticated = ref(false);
onMounted(() => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            isUserAuthenticated.value = true;
            await store.dispatch("fetchReservations"); 
            await store.dispatch("fetchTables");
        } else {
            isUserAuthenticated.value = false;
            console.warn("Utilizator neautentificat");
        }
    });
});


// Variabile pentru validare
const nameError = ref("");
const phoneError = ref("");
const peopleError = ref("");

// Validare pentru nume
const validateName = () => {
    const regex = /^[A-Za-z\s]+$/;
    nameError.value = regex.test(newReservation.value.name) ? "" : "Numele trebuie sa contină doar litere.";
};

// Validare pentru numarul de telefon
const validatePhone = () => {
    const regex = /^[0-9]{10}$/;
    phoneError.value = regex.test(newReservation.value.phoneNumber) ? "" : "Numarul de telefon trebuie sa contină exact 10 cifre.";
};

// Validare pentru numarul de persoane
const validatePeopleCount = () => {
    if (!newReservation.value.table) return;
    const selectedTable = tables.value.find(t => t.name === newReservation.value.table);
    const maxSeats = selectedTable ? parseInt(selectedTable.name.match(/\d+ locuri/)[0]) : 0;

    peopleError.value = newReservation.value.peopleCount > maxSeats
        ? `Aceasta masa are doar ${maxSeats} locuri disponibile.`
        : "";
};

// Functie care valideaza toate campurile inainte de trimiterea formularului
const validateForm = () => {
    validateName();
    validatePhone();
    validatePeopleCount();

    return !nameError.value && !phoneError.value && !peopleError.value;
};

// Functie pentru a adauga o rezervare
const addReservation = async () => {
    // Se opreste trimiterea formularului daca exista erori
    if (!validateForm()) return;

    await store.dispatch("addReservation", newReservation.value);
    await store.dispatch("fetchReservations");

    resetForm();
};

// Functie pentru a incepe editarea unei rezervari
const editReservation = (reservation) => {
    isEditing.value = true;
    editingId.value = reservation.id;

    // Se gaseste masa selectata in rezervare
    const selectedTable = tables.value.find(table => table.name.includes(reservation.table));

    newReservation.value = {
        name: reservation.name,
        date: reservation.date,
        time: reservation.time,
        table: selectedTable ? selectedTable.name : reservation.table, // Se asigura ca apare in field
        peopleCount: reservation.peopleCount,
        phoneNumber: reservation.phoneNumber
    };

    console.log("Masa setată:", newReservation.value.table);
};


// Functie pentru a actualiza o rezervare
const updateReservation = async () => {
    await store.dispatch("updateReservation", newReservation.value);
    resetForm();
};

// Functie pentru a anula editarea
const cancelEdit = () => {
    resetForm();
};

// Functie pentru a reseta formularul
const resetForm = () => {
    isEditing.value = false;
    editingId.value = null;
    newReservation.value = {
        name: "",
        date: "",
        time: "",
        table: "",
        peopleCount: "",
        phoneNumber: ""
    };
};

// Expun variabilele pentru a evita warningurile Vue
defineExpose({
    showModal,
    confirmDelete
});
</script>

<style scoped>
.reservations-container {
    max-width: 800px;
    margin: 50px auto;
    text-align: center;
    background: white;
    padding: 50px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    position: absolute;
    left: 50%;
    transform: translate(-50%);
}

.reservation-form input,
select {
    display: block;
    width: 100%;
    padding: 10px;
    margin: 10px 0;
}

.reservation-list {
    list-style: none;
    padding: 0;
}

.reservation-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f4f4;
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
}

.reservation-list li button {
    margin: 0 5px;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
}

.filter-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin: 20px 0;
}

.filter-buttons button {
    background-color: #2c3e50;
    color: white;
    border: none;
    padding: 8px 15px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.filter-buttons button:hover {
    background-color: #368f6a;
}

.error {
    color: red;
    font-size: 14px;
    margin-top: -10px;
    margin-bottom: 10px;
}

.search-bar {
    margin-top: 15px;
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.button-container {
    display: flex;
    gap: 10px;
}

button {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.edit-btn {
    background-color: #42b983;
}

.delete-btn {
    background-color: #ff4d4d;
}

button:hover {
    opacity: 0.8;
    background-color: darkred;
}
</style>
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

            <input type="number" v-model="newReservation.peopleCount" placeholder="Numar persoane"
                @blur="validatePeopleCount" required />
            <p v-if="peopleError" class="error">{{ peopleError }}</p>

            <input type="text" v-model="newReservation.phoneNumber" placeholder="Telefon" @blur="validatePhone"
                required />
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
        <ul v-if="searchedReservations.length > 0" class="reservation-list">
            <template v-for="reservation in searchedReservations" :key="reservation.id">
                <li class="reservation-item">
                    <span>
                        {{ reservation.name }}: {{ reservation.date }} la {{ reservation.time }} |
                        {{ reservation.table }} | {{ reservation.peopleCount }} persoane
                    </span>
                    <div class="button-container">
                        <button class="edit-btn" @click="editReservation(reservation)">Editează</button>
                        <button class="delete-btn" @click="openModal(reservation.id)">Anuleaza</button>
                        <button class="history-btn" @click="toggleHistory(reservation.id)">Istoric</button>
                    </div>
                </li>

                <li v-if="expandedHistory === reservation.id" class="history-container">
                    <ul v-if="reservation.history && reservation.history.length > 0">
                        <li v-for="(entry, index) in reservation.history" :key="index" class="history-item">
                            Modificat la: {{ formatDate(entry.updatedAt) }} |
                            {{ entry.previousState?.name || 'N/A' }}: {{ entry.previousState?.date || 'N/A' }} |
                            {{ entry.previousState?.table || 'N/A' }} | {{ entry.previousState?.peopleCount || 'N/A' }}
                            persoane
                        </li>
                    </ul>
                    <p v-else>Nu exista modificari anterioare.</p>
                </li>
            </template>
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
const today = new Date().toISOString().split("T")[0]; // Obtin data de astazi in format YYYY-MM-DD
const filterType = ref("all"); // Initial, apar toate rezervarile
const searchQuery = ref(""); // Initial, bara de cautare este goala
const isEditing = ref(false);
const editingId = ref(null);
const expandedHistory = ref(null);

const newReservation = ref({
    name: "",
    date: "",
    time: "",
    table: "",
    peopleCount: "",
    phoneNumber: ""
});

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

const reservations = computed(() => store.getters.allReservations); // Accesez rezervarile din store
const tables = computed(() => store.getters.allFormatedTables); // Accesez mesele din store

// Filtrare rezervari pe baza 'filterType' dupa data pentru cele doua butoane de filtrare
const filteredReservations = computed(() => {
    let reservationsList = reservations.value;

    if (filterType.value === "today") {
        return reservations.value.filter(reservation => reservation.date === today);
    }

    return reservationsList.sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Filtrare dupa nume pentru bara de cautare
const searchedReservations = computed(() => {
    return filteredReservations.value.filter(reservation =>
        reservation?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Se cauta mesele disponibile in functie de data si ora selectata (o masa nu poate fi folosita la aceeasi data si ora de mai multe ori)
const availableTables = computed(() => {
    if (!newReservation.value.date || !newReservation.value.time) {
        // Sorteaza mesele descrescator dupa numarul mesei
        return tables.value.slice().sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)[0]);
            const numB = parseInt(b.name.match(/\d+/)[0]);
            return numB - numA; // Sortare descrescatoare
        });
    }

    let filteredTables = tables.value.filter(table => {
        // Se verifica daca masa este deja rezervata pentru data si ora selectata
        const isTaken = reservations.value.some(reservation =>
            reservation.date === newReservation.value.date &&
            reservation.time === newReservation.value.time &&
            table.name.includes(reservation.table)
        );

        return !isTaken;
    });

    // Se sorteaza mesele disponibile descrescator
    filteredTables.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)[0]);
        const numB = parseInt(b.name.match(/\d+/)[0]);
        return numB - numA;
    });

    // Se adauga manual masa rezervarii daca suntem in modul editare
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

    const reservationData = { ...newReservation.value, history: [] };

    console.log("Trimitere rezervare:", reservationData); // Debugging

    try {
        await store.dispatch("addReservation", reservationData);
        await store.dispatch("fetchReservations");
        resetForm();
    } catch (error) {
        console.error("Eroare la adaugarea rezervarii:", error);
    }
};

const toggleHistory = (id) => {
    expandedHistory.value = expandedHistory.value === id ? null : id;
};

// Functie de formatare data modificata
const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" });
};

// Functie pentru a popula field-urile cu datele rezervarii ce se doreste a fi editata
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
        phoneNumber: reservation.phoneNumber,
        history: reservation.history || [] 
    };

    console.log("Masa setata:", newReservation.value.table);
};

// Functie de actualizare a datelor
const updateReservation = async () => {
    if (!validateForm()) return;

    const updatedReservation = {
        ...newReservation.value,
        id: editingId.value,
        table: newReservation.value.table
        // table: newReservation.value.table.match(/\d+/)[0] // Extragem numarul mesei corect
    };

    try {
        await store.dispatch("updateReservation", updatedReservation);
        await store.dispatch("fetchReservations"); // Actualizez lista rezervarilor
        resetForm();
    } catch (error) {
        console.error("Eroare la actualizarea rezervării:", error);
    }
};


// Functie pentru a anula editarea
const cancelEdit = () => {
    resetForm();
};

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

.history-container {
    background-color: #9de3e7;
    border: 1px solid #9de3e7;
    border-radius: 8px;
    padding: 15px;
    margin-top: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.history-item {
    background: #9de3e7;
    padding: 5px;
    border-bottom: 1px solid #ccc;
}

.history-item:last-child {
    border-bottom: none;
}

.history-btn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.history-btn:hover {
    background-color: #2980b9;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
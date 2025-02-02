<template>
    <div class="reservations-container">
        <h1>Adauga o noua rezervare:</h1>
        <!-- Formular pentru adaugarea unei noi rezervari sau pentru editarea unei rezervari existente -->
        <form @submit.prevent="isEditing ? updateReservation() : addReservation()" class="reservation-form">
            <input type="text" v-model="newReservation.name" placeholder="Nume" required />
            <input type="date" v-model="newReservation.date" required />
            <input type="time" v-model="newReservation.time" required />
            <input type="number" v-model="newReservation.table" placeholder="Numar masa" required />
            <input type="number" v-model="newReservation.peopleCount" placeholder="Numar persoane" required />
            <input type="text" v-model="newReservation.phoneNumber" placeholder="Telefon" required />

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
                    Masa {{ reservation.table }} | {{ reservation.peopleCount }} persoane
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
import ConfirmModal from "@/components/ConfirmModal.vue";

const store = useStore();

const showModal = ref(false);
const reservationToDelete = ref(null);

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
        // Obtin data de azi in format YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];
        return reservations.value.filter(reservation => reservation.date === today);
    }

    return reservationsList.sort((a, b) => new Date(a.date) - new Date(b.date));
});

// Filtrare dupa nume
// ->  Daca o rezervare nu are nume definit, ea este ignorata în cautare, evitand astfel crash-ul aplicatiei.
const searchedReservations = computed(() => {
    return filteredReservations.value.filter(reservation =>
        reservation?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
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

// La montarea componentei, preiau rezervarile deja existente
onMounted(() => {
    store.dispatch("fetchReservations");
});

// Functie pentru a adauga o rezervare
const addReservation = async () => {
    await store.dispatch("addReservation", newReservation.value);

    // Reimprospatez lista dupa ce se adauga o noua rezervare 
    await store.dispatch("fetchReservations");

    resetForm();
};

// Functie pentru a incepe editarea unei rezervări
const editReservation = (reservation) => {
    isEditing.value = true;
    editingId.value = reservation.id;
    newReservation.value = { ...reservation };
};

// Functie pentru a actualiza o rezervare
const updateReservation = async () => {
    await store.dispatch("updateReservation", newReservation.value);
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

.reservation-form input {
    display: block;
    width: 100%;
    padding: 10px;
    margin: 10px 0;
}

.reservation-list {
    list-style: none;
    padding: 0;
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

.search-bar {
    margin-top: 15px;
    padding: 10px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
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
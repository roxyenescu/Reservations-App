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

        <div v-if="reservations.length === 0" class="no-reservations">
            <p>Nu exista rezervari inca.</p>
        </div>

        <!-- Lista rezervarilor -->
        <ul v-else class="reservation-list">
            <li v-for="reservation in reservations" :key="reservation.id">
                <span>
                    {{ reservation.name }}:
                    {{ reservation.date }} la {{ reservation.time }} |
                    Masa {{ reservation.table }} | {{ reservation.peopleCount }} persoane
                </span>

                <!-- Container pentru butoane -->
                <div class="button-container">
                    <button class="edit-btn" @click="editReservation(reservation)">Editează</button>
                    <button class="delete-btn" @click="deleteReservation(reservation.id)">Anuleaza</button>
                </div>
            </li>
        </ul>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

// Accesez rezervarile
const reservations = computed(() => store.getters.allReservations);

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
    await store.dispatch("fetchReservations"); // Reimprospatez lista dupa ce se adauga o noua rezervare 
    resetForm();
};

// Functie pentru a sterge o rezervare
const deleteReservation = async (id) => {
    await store.dispatch("deleteReservation", id);
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
</script>

<style scoped>
.reservations-container {
    max-width: 800px;
    margin: auto;
    text-align: center;
    background: white;
    padding: 50px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
<template>
    <div class="tables-container">
        <h1>Adauga o noua masa</h1>

        <!-- Formular pentru adaugarea unei noi mese -->
        <form @submit.prevent="addTable()" class="tables-form">
            <input type="number" v-model="newTable.tableNumber" placeholder="Numarul noii mese" @blur="validateTableNumber" required />
            <p v-if="tableNumberError" class="error">{{ tableNumberError }}</p>
            
            <input type="number" v-model="newTable.seats" placeholder="Numarul de locuri al noii mese" @blur="validateSeats" required />
            <p v-if="seatsError" class="error">{{ seatsError }}</p>

            <div class="button-group">
                <button type="submit">Adaugare masa</button>
            </div>
        </form>

        <h2>Mese restaurant:</h2>

        <!-- Lista meselor -->
        <div v-if="tables.length === 0" class="no-tables">
            <p>Nu exista mese inca.</p>
        </div>

        <ul v-else class="table-list">
            <li v-for="table in sortedTables" :key="table.id">
                <span>
                    Masa {{ table.tableNumber }} - {{ table.seats }} locuri
                </span>

                <!-- Container pentru butoane -->
                <div class="button-container">
                    <button class="delete-btn" @click="openModal(table.id)">Sterge</button>
                </div>
            </li>
        </ul>

        <!-- Modal pentru confirmarea stergerii -->
        <ConfirmModal :show="showModal" @confirm="confirmDelete" @close="showModal = false" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import ConfirmModal from "@/components/ModalDeleteTable.vue";

const store = useStore();

const showModal = ref(false);
const tableToDelete = ref(null);

 // Stare pentru noua masa 
const newTable = ref({
    tableNumber: "",
    seats: ""
});

// Erori de validare
const tableNumberError = ref("");
const seatsError = ref("");

// La montarea componentei, se preiau rezervarile deja existente
onMounted(() => {
    store.dispatch("fetchTables");
});

// Obtin mesele din store si le sortez descrescator dupa numarul mesei
const tables = computed(() => store.getters.allTables);
const sortedTables = computed(() => {
    return [...tables.value].sort((a, b) => b.tableNumber - a.tableNumber);
});

// Validere pentru numarul mesei
const validateTableNumber = () => {
    const num = parseInt(newTable.value.tableNumber);
    if (isNaN(num) || num <= 0) {
        tableNumberError.value = "Numarul mesei trebuie sa fie un numar pozitiv!";
    } else {
        tableNumberError.value = "";
    }
};

// Validare pentru numarul de locuri al unei mese
const validateSeats = () => {
    const num = parseInt(newTable.value.seats);
    if (isNaN(num) || num < 1 || num > 200) {
        seatsError.value = "Numarul de locuri trebuie sa fie intre 1 si 200!";
    } else {
        seatsError.value = "";
    }
};

// Functie care valideaza toate campurile inainte de trimiterea formularului
const validateForm = () => {
    validateTableNumber();
    validateSeats();

    return !tableNumberError.value && !seatsError.value;
};

// Functie pentru a adauga o masa
const addTable = async () => {
    // Se opreste trimiterea formularului daca exista erori
    if (!validateForm()) return;

    await store.dispatch("addTable", newTable.value);
    await store.dispatch("fetchTables"); // Actualizez lista meselor
    await store.dispatch("fetchReservations"); // Actualizez lista rezervarilor

    resetForm();
};

// Se deschide modalul si se stocheaza masa care trebuie stearsa
const openModal = (id) => {
    tableToDelete.value = id;
    showModal.value = true;
};

// Functie pentru a sterge o masa dupa confirmarea stergerii
const confirmDelete = async () => {
    if (tableToDelete.value) {
        await store.dispatch("deleteTable", tableToDelete.value);
        await store.dispatch("fetchTables"); // Actualizez lista meselor
        await store.dispatch("fetchReservations"); // Actualizez lista rezervarilor
    }
    showModal.value = false;
};

// Functie pentru a reseta formularul
const resetForm = () => {
    newTable.value = {
        tableNumber: "",
        seats: ""
    };
};

</script>

<style scoped>
.tables-container {
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

.tables-form input {
    display: block;
    width: 100%;
    padding: 10px;
    margin: 10px 0;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
}

.table-list {
    list-style: none;
    padding: 0;
}

.table-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f4f4f4;
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
}

.table-list li button {
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

.delete-btn {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    opacity: 0.8;
    background-color: darkred;
}

.error {
    color: red;
    font-size: 14px;
}
</style>
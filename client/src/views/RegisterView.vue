<template>
    <div class="register-container">
        <h2>Inregistrare</h2>
        <form @submit.prevent="handleRegister">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Parola" required />
            <button type="submit">Inregistrare</button>
        </form>

        <p>
            Ai deja cont?
            <router-link to="/login">Autentifica-te aici!</router-link>
        </p>

        <p v-if="errorMessage" class="error">
            {{ errorMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const router = useRouter();

const handleRegister = async () => {
    try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        router.push("/reservations"); // Redirectionare dupa inregistrare
    } catch (error) {
        errorMessage.value = "Eroare la inregistrare: " + error.message;
    }
};
</script>

<style scoped>
.register-container {
    max-width: 400px;
    width: 100%;
    text-align: center;
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

input {
    display: block;
    width: 100%;
    padding: 10px;
    margin: 10px 0;
}

button {
    width: 100%;
    padding: 10px;
}

.error {
    color: red;
}
</style>
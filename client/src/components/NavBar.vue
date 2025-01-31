<template>
    <nav class="navbar">
        <div class="nav-left">
            <router-link class="nav-item" v-if="!user" to="/">Home</router-link>
            <router-link class="nav-item" v-if="user" to="/reservations">Reservations</router-link>
            <router-link class="nav-item" v-if="user" to="/tables">Tables</router-link>
        </div>

        <div class="nav-right">
            <router-link class="nav-item" v-if="!user" to="/login">Login</router-link>
            <router-link class="nav-item" v-if="!user" to="/register">Register</router-link>
            <a class="nav-item" v-if="user" @click="logout">Logout</a>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const user = ref(null);
const router = useRouter();

onMounted(() => {
    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
    });

    // Verific localStorage pentru un token salvat
    const token = localStorage.getItem("authToken");
    if (token) {
        user.value = { email: localStorage.getItem("userEmail") };
    }
});

const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("authToken"); // Sterg token-ul
    user.value = null;
    router.push("/login");
};
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    background-color: #2c3e50;
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
}

.nav-item {
    margin: 0 15px;
    padding: 10px 15px;
    font-weight: bold;
    color: #ffffff;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.nav-item:hover {
    background-color: #42b983;
    cursor: pointer;
}

.nav-left,
.nav-right {
    display: flex;
    align-items: center;
}
</style>
<template>
  <div class="app-container">
    <NavBar />
    <main>
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue';
import { auth } from './config/firebase';

console.log("Firebase Authentication initialized:", auth);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex-grow: 1;
  padding: 20px;
  padding-top: 80px;
}
</style>

<template>
  <NavBar />
  <AppFooter />
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue';
import { auth } from './config/firebase';

console.log("Firebase Authentication initialized:", auth);
</script>

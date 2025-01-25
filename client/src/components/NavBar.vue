<template>
    <nav>
        <ul>
            <li>
                <router-link to="/">Home</router-link>
            </li>
            <li>
                <router-link to="/about">About</router-link>
            </li>
        </ul>
    </nav>
</template>

<script setup>
</script>

<style scoped>
nav ul {
    display: flex;
    gap: 1rem;
    list-style: none;
    padding: 0;
}
</style>
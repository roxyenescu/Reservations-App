import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'; // Import store-ul Vuex

const app = createApp(App)

app.use(router)
app.use(store); // Adaug Vuex

app.mount('#app')

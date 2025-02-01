import { createStore } from 'vuex';
import { auth } from '../config/firebase';

const store = createStore({
    state: {
        reservations: []
    },
    mutations: {
        setReservations(state, reservations) {
            state.reservations = reservations || []; 
        },
        addReservation(state, reservation) {
            state.reservations.push(reservation);
        },
        deleteReservation(state, id) {
            state.reservations = state.reservations.filter(res => res.id !== id);
        },
        updateReservation(state, updatedReservation) {
            const index = state.reservations.findIndex(res => res.id === updatedReservation.id);
            if (index !== -1) {
                state.reservations[index] = updatedReservation;
            }
        }
    },
    actions: {
        async fetchReservations({ commit }) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken(); // Obtin token-ul Firebase inainte de request-ul catre backend

                const response = await fetch("http://localhost:3000/reservations", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`, // Adaug token-ul in request pentru autentificare
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                const data = await response.json();
                commit('setReservations', data);
            } catch (error) {
                console.error("Eroare la preluarea rezervarilor:", error);
                commit('setReservations', []);
            }
        },

        async addReservation({ commit }, reservation) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch("http://localhost:3000/reservations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(reservation)
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                const data = await response.json();
                commit('addReservation', data);
            } catch (error) {
                console.error("Eroare la adăugarea rezervării:", error);
            }
        },

        async deleteReservation({ commit }, id) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch(`http://localhost:3000/reservations/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                commit('deleteReservation', id);
            } catch (error) {
                console.error("Eroare la stergerea rezervarii:", error);
            }
        },

        async updateReservation({ commit }, updatedReservation) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch(`http://localhost:3000/reservations/${updatedReservation.id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedReservation)
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                commit('updateReservation', updatedReservation);
            } catch (error) {
                console.error("Eroare la actualizarea rezervării:", error);
            }
        }
    },
    getters: {
        allReservations: (state) => state.reservations
    }
});

export default store;

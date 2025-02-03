import { createStore } from 'vuex';
import { auth } from '../config/firebase';

const store = createStore({
    state: {
        reservations: [],
        tables: []
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
        },
        setTables(state, tables) {
            state.tables = tables || [];
        },
        addTable(state, table) {
            state.tables.push(table);
        },
        deleteTable(state, id) {
            state.tables = state.tables.filter(res => res.id !== id);
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

        async fetchTables({ commit }) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch("http://localhost:3000/tables", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                const data = await response.json();
                commit('setTables', data);

            } catch (error) {
                console.error("Eroare la preluarea meselor: ", error);
                commit('setTables', []);
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

                console.log("Trimit datele catre server:", reservation);

                const response = await fetch("http://localhost:3000/reservations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ ...reservation, history: [] })
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${responseData.error || response.statusText}`);
                }

                const responseData = await response.json();
                commit('addReservation', responseData);
            } catch (error) {
                console.error("Eroare la adaugarea rezervarii:", error);
            }
        },

        async addTable({ commit }, table) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch("http://localhost:3000/tables", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(table)
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                const data = await response.json();
                commit('addTable', data);

            } catch (error) {
                console.error("Eroare la adaugarea mesei: ", error);
                commit('addTable', []);
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

        async deleteTable({ commit }, id) {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("Utilizator neautentificat!");
                    return;
                }

                const token = await user.getIdToken();

                const response = await fetch(`http://localhost:3000/tables/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Eroare: ${response.statusText}`);
                }

                commit('deleteTable', id);

            } catch (error) {
                console.error("Eroare la stergerea mesei: ", error);
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

                // Trimit update direct la backend, fără GET înainte
                const response = await fetch(`http://localhost:3000/reservations/${updatedReservation.id}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedReservation)
                });

                if (!response.ok) {
                    throw new Error(`Eroare la actualizarea rezervării: ${response.statusText}`);
                }

                const data = await response.json();
                commit('updateReservation', data.updatedData);
            } catch (error) {
                console.error("Eroare la actualizarea rezervării:", error);
            }
        },

    },
    getters: {
        allReservations: (state) => state.reservations,
        allTables: (state) => state.tables,

        allFormatedTables: (state) => {
            return state.tables.map(table => ({
                id: table.id,
                name: `Masa ${table.tableNumber} - ${table.seats} locuri`
            }));
        }
    }
});

export default store;

<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal">
            <p>Esti sigur ca vrei sa anulezi aceasta rezervare?</p>
            <div class="button-group">
                <button class="confirm-btn" @click="confirm">Da</button>
                <button class="cancel-btn" @click="close">Nu</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    show: Boolean,
});

const emit = defineEmits(["confirm", "close"]);

const confirm = () => {
    emit("confirm");
};

const close = () => {
    emit("close");
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
}

.confirm-btn {
    background-color: #42b983;
    color: white;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
}

.cancel-btn {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
}

.confirm-btn:hover {
    opacity: 0.8;
}

.cancel-btn:hover {
    opacity: 0.8;
}
</style>
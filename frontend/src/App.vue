<script setup>
// Реалізуйте тут інтерфейс карти, пошуку та вибору станції.
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Header from './components/Header.vue'

const mapElement = ref(null)
let map

const goHome = () => map?.setView([48.7, 31.2], 6)

onMounted(() => {
    map = L.map(mapElement.value).setView([51.505, -0.09], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map)
})

onUnmounted(() => {
    map?.remove()
})
</script>

<template>
    <main class="app">
        <Header @go-home="goHome" />

        <section class="page">
            <aside>1</aside>
            <div ref="mapElement" id="map"></div>
            <aside>3</aside>
        </section>
    </main>
</template>

<style scoped>
.app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.page {
    margin: 0 auto;
    padding: 48px 28px;
    flex: 1;
    display: grid;
    grid-template-columns: 320px minmax(320px, 1fr) 360px;
    gap: 12px;
    width: 100%;
}
</style>

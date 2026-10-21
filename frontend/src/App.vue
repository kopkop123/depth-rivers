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
    <Header @go-home="goHome" />
    <main class="page">
        <section class="map-placeholder" aria-label="Місце для карти станцій">
            <div ref="mapElement" id="map"></div>
        </section>
    </main>
</template>

<style>
#map {
    width: 100%;
    height: min(65vh, 520px);
    min-height: 400px;
}
</style>

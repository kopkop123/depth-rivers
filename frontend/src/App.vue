<script setup>
// Реалізуйте тут інтерфейс карти, пошуку та вибору станції.
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Header from './components/Header.vue'

const mapElement = ref(null)
let map

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
    <Header />
    <main class="page">
        <header class="page-header">
            <p class="eyebrow">Тестовий проєкт</p>
            <h1>Станції вимірювання рівня води</h1>
            <p class="intro">Додайте інтерфейс для пошуку станцій і перегляду їхніх вимірювань.</p>
        </header>

        <section class="map-placeholder" aria-label="Місце для карти станцій">
            <!--            <img src="/map-background.svg" alt="Схематичне тло карти"/>-->
            <!--            <p>Місце для карти</p>-->
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

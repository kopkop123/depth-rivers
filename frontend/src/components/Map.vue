<template>
    <div ref="mapElement"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const HOME_COORDINATES = [48.7, 31.2]

const mapElement = ref(null)
let map

const goHome = () => map?.setView(HOME_COORDINATES, 6)

onMounted(() => {
    map = L.map(mapElement.value).setView(HOME_COORDINATES, 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(map)
})

onUnmounted(() => {
    map?.remove()
})

defineExpose({
    goHome,
})
</script>

<style scoped></style>

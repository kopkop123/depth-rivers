<template>
    <section class="map" aria-label="Карта станцій вимірювання рівня води">
        <button class="map__action" title="Показати Україну" @click="goHome()" type="button">
            <span>◎</span> Огляд країни
        </button>
        <div class="map__container" ref="mapElement"></div>
        <div v-if="loadingStations" class="map__loading">
            <span class="spinner"></span> Оновлюємо станції…
        </div>
        <div v-if="mapNotice && !loadingStations && !stationsError" class="map__notice">
            {{ mapNotice }}
        </div>
        <div class="map__zoom">
            {{ mapReady ? `Масштаб ${map?.getZoom() ?? 6}×` : 'Завантаження карти' }}
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStations } from '../composables/useStations.js'
import { escapeHtml, formatNumber } from '../utils/utils.js'

const HOME_COORDINATES = [48.7, 31.2]

const mapElement = ref(null)
const search = ref('')
const mobilePanel = ref('stations')

let map
let markersLayer
let moveTimer
const mapReady = ref(false)
const markers = new Map()

const {
    stations,
    selectedStation,
    selectedId,
    measurements,
    loadingStations,
    loadingMeasurements,
    stationsError,
    measurementsError,
    mapNotice,
    loadStations,
    selectStation,
    clearSelectedStation,
} = useStations({
    getBoundsQuery,
    renderMarkers,

    fitStations(stations) {
        const bounds = L.latLngBounds(
            stations.map((station) => [
                station.coordinates.latitude,
                station.coordinates.longitude,
            ]),
        )

        map.fitBounds(bounds.pad(0.12), { maxZoom: 10 })
    },

    panToStation(station) {
        if (map) {
            map.panTo([station.coordinates.latitude, station.coordinates.longitude], {
                animate: true,
            })
        }
    },

    onSelect() {
        mobilePanel.value = 'details'
    },
})

const goHome = () => map?.setView(HOME_COORDINATES, 6)

function getBoundsQuery() {
    const bounds = map.getBounds()
    return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]
        .map((value) => value.toFixed(5))
        .join(',')
}

function makeMarkerIcon(station, selected = false) {
    const value = escapeHtml(formatNumber(station.latestMeasurement.value))
    return L.divIcon({
        className: 'station-marker-wrapper',
        html: `<div class="station-marker ${selected ? 'is-selected' : ''}"><span class="marker-dot"></span><span class="marker-value">${value} ${escapeHtml(station.latestMeasurement.unit)}</span></div>`,
        iconSize: [58, 27],
        iconAnchor: [44, 17],
    })
}

function renderMarkers() {
    if (!map || !markersLayer) return
    markersLayer.clearLayers()
    markers.clear()
    stations.value.forEach((station) => {
        const marker = L.marker([station.coordinates.latitude, station.coordinates.longitude], {
            icon: makeMarkerIcon(station, station.id === selectedId.value),
            title: station.name,
            keyboard: true,
        })
        marker.on('click', () => selectStation(station))
        marker.bindTooltip(`${station.name} · ${station.river}`, {
            direction: 'top',
            offset: [0, -12],
        })
        marker.addTo(markersLayer)
        markers.set(station.id, marker)
    })
}

onMounted(async () => {
    map = L.map(mapElement.value, { preferCanvas: true }).setView(HOME_COORDINATES, 6)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map)

    markersLayer = L.layerGroup().addTo(map)

    map.on('moveend', () => {
        clearTimeout(moveTimer)
        moveTimer = setTimeout(() => {
            if (!search.value.trim()) loadStations({ query: '' })
        }, 120)
    })
    mapReady.value = true
    await nextTick()
    map.invalidateSize()
    await loadStations({ query: '' })
})

onUnmounted(() => {
    clearTimeout(moveTimer)
    map?.remove()
})

defineExpose({
    goHome,
})
</script>

<style scoped>
.map {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #dce8e2;
    background: #eaf0eb;
}

.map__container {
    position: absolute;
    width: 100%;
    height: 100%;
}

.map__loading {
    position: absolute;
    top: 76px;
    right: 14px;
    z-index: 500;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 12px;
    background: #fff;
    border: 1px solid #e5ece8;
    border-radius: 9px;
    box-shadow: 0 3px 12px rgba(35, 76, 58, 0.07);
    color: #658176;
    font-size: 10px;
}

.map__notice {
    position: absolute;
    top: 75px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    padding: 10px 13px;
    background: #fff;
    border: 1px solid #e4ebe6;
    border-radius: 9px;
    box-shadow: 0 3px 12px rgba(35, 76, 58, 0.07);
    color: #698077;
    font-size: 10px;
    max-width: 80%;
    text-align: center;
}

.map__zoom {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 500;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #e4ebe6;
    border-radius: 8px;
    padding: 8px 10px;
    color: #7c9187;
    font-size: 9px;
}

.map__action {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 500;
    cursor: pointer;
    box-shadow: 0 3px 14px rgba(35, 76, 58, 0.08);
    border: 1px solid #e5ece7;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 9px;
    padding: 10px 12px;
    font-size: 10px;
    font-weight: 600;
    color: #5d776d;
    display: flex;
    align-items: center;

    span {
        color: #168e78;
        font-size: 14px;
        margin-right: 4px;
    }
}

.spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #dcebe5;
    border-top-color: #168e78;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>

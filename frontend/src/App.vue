<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Map from './components/Map.vue'
import StationCard from './components/StationCard.vue'
import SearchSidebar from './components/SearchSidebar.vue'

const mapComponentRef = ref(null)
const search = ref('')

const stationsState = ref({
    stations: [],
    selectedId: null,
    loadingStations: false,
    stationsError: '',
    mapNotice: '',
})

const stationState = ref({
    selectedStation: null,
    measurements: [],
    loadingMeasurements: false,
    measurementsError: '',
})

function onStationState(state) {
    stationState.value = state
}

function onStationsState(state) {
    stationsState.value = state
}

function onSearchInput() {
    mapComponentRef.value?.searchStations(search.value)
}

function clearSearch() {
    search.value = ''
    mapComponentRef.value?.searchStations('')
}

function retryStations() {
    mapComponentRef.value?.retryStations()
}

function focusStation(station) {
    mapComponentRef.value?.focusStation(station)
}

const goHome = () => {
    mapComponentRef.value?.goHome()
}

function closeStationCard() {
    mapComponentRef.value?.clearSelectedStation()
}

function retryMeasurements() {
    mapComponentRef.value?.retryMeasurements()
}
</script>

<template>
    <main class="app">
        <Header @go-home="goHome" />

        <section class="page">
            <SearchSidebar
                v-model:search="search"
                :stations="stationsState.stations"
                :selected-id="stationsState.selectedId"
                :loading-stations="stationsState.loadingStations"
                :stations-error="stationsState.stationsError"
                :map-notice="stationsState.mapNotice"
                @search-input="onSearchInput"
                @clear-search="clearSearch"
                @retry-stations="retryStations"
                @focus-station="focusStation"
            />
            <Map
                ref="mapComponentRef"
                @station-state="onStationState"
                @stations-state="onStationsState"
            />
            <StationCard
                v-bind="stationState"
                @close="closeStationCard"
                @retry="retryMeasurements"
            />
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

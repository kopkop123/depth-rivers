<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Map from './components/Map.vue'
import StationCard from './components/StationCard.vue'
import SearchSidebar from './components/SearchSidebar.vue'

const mapComponentRef = ref(null)
const search = ref('')
const isSearchSidebarOpen = ref(false)
const isStationCardOpen = ref(false)

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

function openSearchSidebar() {
    isSearchSidebarOpen.value = true
    isStationCardOpen.value = false
}

function openStationCard() {
    isStationCardOpen.value = true
    isSearchSidebarOpen.value = false
}

function closeSidebars() {
    isSearchSidebarOpen.value = false
    isStationCardOpen.value = false
}
</script>

<template>
    <main class="app">
        <Header @go-home="goHome" />

        <section class="page">
            <button
                class="station-card-button"
                @click="isStationCardOpen ? closeSidebars() : openStationCard()"
            >
                <span aria-hidden="true">▤</span>
                Дані станції
            </button>

            <Transition name="backdrop">
                <button
                    v-if="isSearchSidebarOpen || isStationCardOpen"
                    type="button"
                    class="page__backdrop"
                    aria-label="Закрити бокову панель"
                    @click="closeSidebars"
                />
            </Transition>

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
                @close-sidebars="closeSidebars"
                :is-mobile="isStationCardOpen"
                class="page__station-card"
                :class="{ 'is-open': isStationCardOpen }"
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

.page__backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: rgb(15 35 29 / 45%);
}

.backdrop-enter-active,
.backdrop-leave-active {
    transition: opacity 0.28s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
    opacity: 0;
}

.station-card-button {
    display: none;
    position: absolute;
    top: 8px;
    right: 28px;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #e4ebe6;
    border-radius: 8px;
    font-size: 10px;
    padding: 8px 10px;
    color: #7c9187;
}

@media (max-width: 1260px) {
    .page {
        grid-template-columns: 320px minmax(320px, 1fr);
        overflow: hidden;
        position: relative;
    }

    .station-card-button {
        display: block;
    }

    .page__station-card {
        position: absolute;
        top: 48px;
        right: 0;
        bottom: 48px;
        z-index: 2100;
        max-width: 360px;
        width: 100%;
        transform: translateX(100%);
        transition: transform 0.28s ease;
    }

    .page__station-card.is-open {
        transform: translateX(0);
    }
}

@media (max-width: 860px) {
    .page {
        grid-template-columns: 1fr;
        padding: 48px 16px;
    }

    .station-card-button {
        right: 16px;
    }
}
</style>

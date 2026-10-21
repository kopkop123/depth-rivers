<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Map from './components/Map.vue'

const mapComponentRef = ref(null)

const goHome = () => {
    mapComponentRef.value?.goHome()
}
</script>

<template>
    <main class="app">
        <Header @go-home="goHome" />

        <section class="page">
            <aside>1</aside>
            <Map ref="mapComponentRef" />
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

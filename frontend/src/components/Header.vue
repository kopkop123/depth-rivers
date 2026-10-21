<template>
    <header class="header">
        <a
            class="brand"
            href="#"
            aria-label="ГідроМапа — на головну"
            @click.prevent="map?.setView([48.7, 31.2], 6)"
        >
            <span class="brand-mark"
                ><svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M16 3C12 9 6 15 6 20a10 10 0 0 0 20 0C26 15 20 9 16 3Z" />
                    <path d="M10 21c2 2 4 3 7 2" /></svg
            ></span>
            <span class="brand-copy"><strong>ГідроМапа</strong><small>Моніторинг води</small></span>
        </a>
        <div class="topbar-meta">
            <span class="live-dot"></span> Дані вимірювань <strong>·</strong> тестове середовище
        </div>
    </header>
</template>

<script setup></script>

<style scoped>
.header {
    height: 70px;
    border-bottom: 1px solid #e9efec;
    background-color: #fff;
    padding: 0 34px;
    display: flex;
    align-items: center;
}
</style>

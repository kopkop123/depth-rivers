<template>
    <header class="header">
        <a
            class="header__link"
            href="#"
            aria-label="ГідроМапа — на головну"
            @click.prevent="$emit('goHome')"
        >
            <span class="header__logo">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M16 3C12 9 6 15 6 20a10 10 0 0 0 20 0C26 15 20 9 16 3Z" />
                    <path d="M10 21c2 2 4 3 7 2" />
                </svg>
            </span>
            <span class="header__text-wrapper">
                ГідроМапа
                <span>Станції вимірювання рівня води</span>
            </span>
        </a>
    </header>
</template>

<script setup>
defineEmits(['goHome'])
</script>

<style scoped>
.header {
    height: 76px;
    border-bottom: 1px solid #e9efec;
    background-color: #fff;
    padding: 0 34px;
    display: flex;
    gap: 28px;
    align-items: center;
}

.header__link {
    display: flex;
    align-items: center;
    gap: 12px;
    color: inherit;
    text-decoration: none;
    min-width: 230px;
}

.header__logo {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 13px;
    background: #e6f5ef;

    svg {
        width: 26px;
        fill: none;
        stroke: #168e78;
        stroke-width: 2.4;
        stroke-linecap: round;
    }
}

.header__text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-family: Manrope, sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.5px;

    span {
        font-size: 10px;
        font-weight: 500;
        color: #8b9e98;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }
}

@media (max-width: 860px) {
    .header {
        padding: 0 16px;
    }
}
</style>

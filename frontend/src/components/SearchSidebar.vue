<template>
    <aside class="sidebar">
        <p class="sidebar__top">Гідрологічна мережа</p>
        <h2 class="sidebar__title">Станції на мапі</h2>

        <p class="sidebar__intro">
            Знаходьте пости спостереження та відстежуйте зміни рівня води в річках.
        </p>

        <label class="sidebar__search-box">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
            </svg>

            <input
                :value="search"
                type="search"
                placeholder="Назва станції або річки"
                aria-label="Пошук станції або річки"
                @input="
                    (e) => {
                        emit('update:search', e.target.value)
                        emit('search-input')
                    }
                "
            />

            <button
                v-if="search"
                type="button"
                class="sidebar__clear-search"
                aria-label="Очистити пошук"
                @click="emit('clear-search')"
            >
                ×
            </button>
        </label>

        <div class="sidebar__toolbar">
            <span class="sidebar__toolbar-label">
                Станції <span class="count-pill">{{ stations.length }}</span>
            </span>

            <span v-if="loadingStations" class="sidebar__loading-label">
                <span class="spinner"></span>
                Оновлення
            </span>

            <button
                type="button"
                class="sidebar__update-button"
                :disabled="loadingStations"
                title="Оновити список"
                @click="emit('retry-stations')"
            >
                ↻ Оновити
            </button>
        </div>

        <div class="sidebar__list" :class="{ 'is-loading': loadingStations && !stations.length }">
            <div v-if="stationsError" class="sidebar__list-empty">
                <strong>Не вдалося завантажити станції</strong>
                <p>{{ stationsError }}</p>

                <button type="button" class="sidebar__retry-button" @click="emit('retry-stations')">
                    Спробувати ще раз
                </button>
            </div>

            <div
                v-else-if="loadingStations && !stations.length"
                class="sidebar__skeleton-list"
                aria-label="Завантаження станцій"
            >
                <div v-for="n in 5" :key="n" class="sidebar__skeleton-item">
                    <i></i>
                    <span><b></b><b></b></span>
                    <em></em>
                </div>
            </div>

            <div v-else-if="!stations.length" class="sidebar__list-empty">
                <strong>Станцій не знайдено</strong>
                <p>{{ mapNotice || 'Спробуйте іншу назву або перемістіть карту.' }}</p>
            </div>

            <template v-else>
                <button
                    v-for="station in stations"
                    :key="station.id"
                    type="button"
                    class="sidebar__list-item"
                    :class="{ 'is-active': station.id === selectedId }"
                    @click="emit('focus-station', station)"
                >
                    <span class="sidebar__list-item-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
                            <circle cx="12" cy="9" r="2.2" />
                        </svg>
                    </span>

                    <span class="sidebar__list-item-info">
                        <strong>{{ station.name }}</strong>
                        <span>{{ station.river }} · {{ station.id }}</span>
                        <small>
                            {{ formatDateTime(station.latestMeasurement?.measuredAt) }}
                        </small>
                    </span>

                    <span class="sidebar__list-item-value">
                        <strong>
                            {{ formatNumber(station.latestMeasurement?.value) }}
                        </strong>
                        <small>{{ station.latestMeasurement?.unit || '' }}</small>
                    </span>
                </button>

                <div class="sidebar__list-item-footer">
                    <template v-if="total > stations.length">
                        Показано {{ formatInteger(stations.length) }} із
                        {{ formatInteger(total) }} станцій
                        <button
                            type="button"
                            class="sidebar__more-button"
                            :disabled="loadingStations"
                            @click="emit('load-more')"
                        >
                            Показати ще
                        </button>
                        <p v-if="!search.trim()">
                            Або наблизьте карту, щоб побачити станції у потрібному місці
                        </p>
                    </template>
                    <template v-else>
                        {{ search.trim() ? 'Усі станції за запитом' : 'Усі станції в цій області' }}
                    </template>
                </div>
            </template>
        </div>

        <div class="sidebar__footer">
            <span class="sidebar__footer-icon"></span>
            Карта оновлюється під час переміщення
        </div>
    </aside>
</template>

<script setup>
import { formatDateTime, formatInteger, formatNumber } from '../utils/utils.js'

defineProps({
    search: {
        type: String,
        default: '',
    },
    stations: {
        type: Array,
        default: () => [],
    },
    selectedId: {
        type: [String, Number],
        default: null,
    },
    loadingStations: {
        type: Boolean,
        default: false,
    },
    stationsError: {
        type: String,
        default: '',
    },
    mapNotice: {
        type: String,
        default: '',
    },
    total: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits([
    'update:search',
    'search-input',
    'clear-search',
    'retry-stations',
    'focus-station',
    'load-more',
])
</script>

<style scoped>
.sidebar {
    background: #fff;
    border: 1px solid #e5ece8;
    border-radius: 16px;
    overflow: hidden;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 20px 0;
}

.sidebar__top {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: #7d9a90;
    margin: 0 0 8px;
}

.sidebar__title {
    font-family: Manrope, sans-serif;
    letter-spacing: -0.6px;
    font-size: 22px;
    margin: 0;
    font-weight: 800;
}

.sidebar__intro {
    font-size: 12px;
    line-height: 1.65;
    color: #80918b;
    margin: 10px 0 20px;
}

.sidebar__search-box {
    margin: 0 0 22px;
    height: 43px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 11px;
    border: 1px solid #e2ebe6;
    border-radius: 10px;
    background: #fbfdfc;
    transition:
        border-color 0.2s,
        box-shadow 0.2s;

    svg {
        width: 17px;
        flex-shrink: 0;
        fill: none;
        stroke: #8ba19a;
        stroke-width: 1.8;
    }

    input {
        border: 0;
        outline: 0;
        background: transparent;
        width: 100%;
        min-width: 0;
        color: #26463d;
        font-size: 11px;
    }

    input[type='search']::-webkit-search-cancel-button {
        display: none;
    }

    input::placeholder {
        color: #a0afa9;
    }
}

.sidebar__search-box:focus-within {
    border-color: #86cdbb;
    box-shadow: 0 0 0 3px #e8f7f1;
}

.sidebar__clear-search {
    border: 0;
    background: none;
    color: #80948c;
    font-size: 20px;
    padding: 0 2px;
    cursor: pointer;
}

.sidebar__toolbar {
    padding: 0 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    border-bottom: 1px solid #edf1ef;
}

.sidebar__toolbar-label {
    font-size: 11px;
    font-weight: 700;
    color: #3c5a50;

    span {
        display: inline-grid;
        place-items: center;
        min-width: 19px;
        height: 19px;
        padding: 0 5px;
        margin-left: 4px;
        border-radius: 6px;
        background: #edf7f2;
        color: #258b73;
        font-size: 10px;
    }
}

.sidebar__update-button {
    border: 0;
    background: none;
    color: #5d8c7c;
    font-size: 10px;
    margin-left: auto;
    padding: 4px 0;
    cursor: pointer;
}

.sidebar__loading-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #7e958c;
    font-size: 9px;
}

.sidebar__list {
    overflow-y: auto;
    flex: 1;
    min-height: 160px;
    max-height: calc(100vh - 460px);
    scrollbar-width: thin;
    scrollbar-color: #dce7e1 transparent;
}

.sidebar__list-item {
    width: 100%;
    display: flex;
    align-items: center;
    text-align: left;
    gap: 10px;
    padding: 14px 15px;
    border: 0;
    border-bottom: 1px solid #f0f3f1;
    background: #fff;
    transition: background 0.16s;
    min-width: 0;
    cursor: pointer;
}

.sidebar__list-item:hover {
    background: #f8fbf9;
}

.sidebar__list-item.is-active {
    background: #edf8f3;
    box-shadow: inset 3px 0 #168e78;

    .sidebar__list-item-icon {
        background: #d7f0e6;
        color: #168e78;
    }
}

.sidebar__list-item-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #f0f6f3;
    color: #5b9e89;

    svg {
        width: 17px;
        fill: none;
        stroke: currentColor;
        stroke-width: 1.6;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
}

.sidebar__list-item-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;

    strong {
        font-size: 11px;
        font-weight: 700;
        color: #34544a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    span {
        font-size: 10px;
        color: #849790;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    small {
        font-size: 9px;
        color: #a0aea8;
    }
}

.sidebar__list-item-value {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;

    strong {
        font-family: Manrope, sans-serif;
        font-size: 12px;
        color: #168e78;
    }

    small {
        font-size: 9px;
        color: #8ea39a;
    }
}

.sidebar__list-item-footer {
    padding: 12px 15px;
    color: #9aaba4;
    font-size: 9px;
    text-align: center;
}

.sidebar__more-button {
    display: block;
    margin: 8px auto 0;
    padding: 7px 12px;
    border: 1px solid #cfe5db;
    border-radius: 8px;
    background: #f3faf6;
    color: #168e78;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: default;
    }
}

.sidebar__list-item-footer p {
    margin: 8px 0 0;
}

.sidebar__list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 18px;
    color: #82958b;

    strong {
        font-size: 11px;
        color: #526d61;
    }

    p {
        font-size: 10px;
        line-height: 1.6;
        margin: 7px 0 12px;
    }
}

.sidebar__retry-button {
    padding: 9px 12px;
    border: 0;
    border-radius: 8px;
    background: #168e78;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
}

.sidebar__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 17px;
    border-top: 1px solid #edf1ef;
    color: #8a9b94;
    font-size: 9px;
    flex-shrink: 0;
    margin-top: auto;
}

.sidebar__footer-icon {
    background: #27ad86;
    border-radius: 50%;
    display: inline-block;
    width: 6px;
    height: 6px;
    box-shadow: 0 0 0 3px #e4f5ed;
}

.sidebar__skeleton-list {
    padding: 10px 14px;
}

.sidebar__skeleton-item {
    height: 58px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #f0f3f1;
}

.sidebar__skeleton-item i,
.sidebar__skeleton-item b,
.sidebar__skeleton-item em {
    display: block;
    background: linear-gradient(90deg, #edf2ef, #f6f8f6, #edf2ef);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
}

.sidebar__skeleton-item i {
    width: 31px;
    height: 31px;
}

.sidebar__skeleton-item span {
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
}

.sidebar__skeleton-item b {
    height: 7px;
    width: 80%;
}

.sidebar__skeleton-item b + b {
    width: 55%;
}

.sidebar__skeleton-item em {
    width: 35px;
    height: 12px;
}

@keyframes shimmer {
    to {
        background-position: -200% 0;
    }
}
</style>

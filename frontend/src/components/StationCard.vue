<template>
    <aside class="station-sidebar">
        <div v-if="selectedStation" class="station-card">
            <button
                class="station-card__close"
                aria-label="Скасувати вибір станції"
                type="button"
                @click="
                    () => {
                        if (!isMobile) emit('close')

                        emit('close-sidebars')
                    }
                "
            >
                &#10005;
            </button>
            <p class="station-card__title">Картка спостереження</p>
            <h2 class="station-card__name">{{ selectedStation.name }}</h2>
            <p class="station-card__river">
                <span>≋</span>
                {{ selectedStation.river }}
            </p>

            <div class="station-card__current-level">
                <span class="station-card__current-level-top">Останній рівень води</span>
                <div class="station-card__current-level-number">
                    {{ formatNumber(selectedStation.latestMeasurement.value) }}
                    <span>{{ selectedStation.latestMeasurement.unit }}</span>
                </div>
                <div class="station-card__current-level-bottom">
                    <span>◷</span>
                    {{ formatDateTime(selectedStation.latestMeasurement.measuredAt) }}
                </div>
            </div>

            <div class="station-card__trend">
                <span class="station-card__trend-icon" :class="`trend-${trend}`">
                    {{ trendSymbol }}
                </span>
                <div class="station-card__trend-info">
                    <span>{{ trendText }}</span>
                    Порівняно з попереднім виміром
                </div>
                <span
                    v-if="measurements.length > 1"
                    class="station-card__trend-delta"
                    :class="`trend-${trend}`"
                >
                    {{ trendDeltaText }}
                </span>
            </div>

            <div class="station-card__divider"></div>

            <div class="station-card__chart-header">
                <div>
                    <h3>Динаміка рівня</h3>
                    <p>Історія вимірювань</p>
                </div>

                <div class="station-card__range-switch">
                    <button :class="{ active: activeRange === '7' }" @click="activeRange = '7'">
                        7 дн.
                    </button>
                    <button :class="{ active: activeRange === '15' }" @click="activeRange = '15'">
                        15 дн.
                    </button>
                    <button :class="{ active: activeRange === 'all' }" @click="activeRange = 'all'">
                        Усі
                    </button>
                </div>
            </div>

            <div v-if="loadingMeasurements" class="station-card__chart-loading">
                <span class="spinner"></span> Завантажуємо вимірювання…
            </div>
            <div v-else-if="measurementsError" class="station-card__chart-error">
                <p>{{ measurementsError }}</p>
                <button class="station-card__button" @click="emit('retry')">
                    Спробувати ще раз
                </button>
            </div>
            <div v-else-if="filteredMeasurements.length" class="station-card__chart-wrapper">
                <div class="station-card__chart-labels">
                    <span>{{ chartMinMax.max }} {{ unit }}</span
                    ><span>{{ chartMinMax.min }} {{ unit }}</span>
                </div>
                <svg
                    class="station-card__chart"
                    viewBox="0 0 520 150"
                    preserveAspectRatio="none"
                    role="img"
                    :aria-label="`Графік рівня води, ${filteredMeasurements.length} вимірювань`"
                >
                    <defs>
                        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#1a9b83" stop-opacity=".22" />
                            <stop offset="100%" stop-color="#1a9b83" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                    <line
                        v-for="y in [12, 54, 96, 138]"
                        :key="y"
                        x1="12"
                        :y1="y"
                        x2="508"
                        :y2="y"
                        stroke="#e7efec"
                        stroke-dasharray="4 5"
                    />
                    <polygon
                        v-if="chartPoints"
                        :points="`12,150 ${chartPoints} 508,150`"
                        fill="url(#chartFill)"
                    />
                    <polyline
                        v-if="chartPoints"
                        :points="chartPoints"
                        fill="none"
                        stroke="#169b83"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                    />
                    <circle
                        v-if="filteredMeasurements.length"
                        :cx="filteredMeasurements.length === 1 ? 260 : 508"
                        cy="0"
                        r="0"
                        fill="#169b83"
                    />
                </svg>
                <div class="station-card__chart-dates">
                    <span>
                        {{
                            formatDate(
                                filteredMeasurements[filteredMeasurements.length - 1]?.measuredAt,
                            )
                        }}
                    </span>
                    <span>{{ formatDate(filteredMeasurements[0]?.measuredAt) }}</span>
                </div>
            </div>
            <div v-else class="station-card__empty-chart">Немає вимірювань за цей період.</div>

            <div class="station-card__divider"></div>

            <div class="station-card__history-header">
                <h3>Останні вимірювання</h3>
                <span>{{ measurements.length }} записів</span>
            </div>

            <div v-if="measurements.length" class="station-card__list">
                <div
                    v-for="(measurement, index) in measurements"
                    :key="measurement.id"
                    class="station-card__list-row"
                >
                    <span class="station-card__list-index">
                        {{ String(index + 1).padStart(2, '0') }}
                    </span>

                    <span class="station-card__list-date">
                        <strong>
                            {{
                                formatDate(measurement.measuredAt, {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                            }}
                        </strong>
                        <small>
                            {{ formatTime(measurement.measuredAt) }}
                        </small>
                    </span>
                    <span class="station-card__list-distance">
                        {{ formatNumber(measurement.value) }}
                        <small>{{ measurement.unit }}</small>
                    </span>
                </div>
            </div>
            <div
                v-else-if="!loadingMeasurements && !measurementsError"
                class="station-card__empty-chart"
            >
                Історія вимірювань відсутня.
            </div>
        </div>
        <div v-else class="station-card-empty">
            <div class="station-card-empty__illustration">
                <span class="station-card-empty__orbit station-card-empty__orbit--one"></span>
                <span class="station-card-empty__orbit station-card-empty__orbit--two"></span>
                <span class="station-card-empty__drop">
                    <svg viewBox="0 0 64 64" aria-hidden="true">
                        <path d="M32 6C24 18 13 29 13 40a19 19 0 0 0 38 0C51 29 40 18 32 6Z" />
                        <path d="M22 41c2 5 6 7 11 7" />
                    </svg>
                </span>
            </div>
            <p class="station-card-empty__info">Досліджуйте водні ресурси</p>
            <h2 class="station-card-empty__title">Оберіть станцію</h2>
            <p class="station-card-empty__description">
                Натисніть на маркер на карті або виберіть станцію зі списку, щоб переглянути останні
                вимірювання та динаміку рівня води.
            </p>
            <div class="station-card-empty__tip">
                <span>✦</span>
                <p><span>Підказка</span><br />Використовуйте пошук за назвою поста або річки.</p>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue'
import { formatDate, formatDateTime, formatNumber, formatTime } from '../utils/utils.js'

const props = defineProps({
    selectedStation: {
        type: Object,
        default: null,
    },
    measurements: {
        type: Array,
        default: () => [],
    },
    loadingMeasurements: {
        type: Boolean,
        default: false,
    },
    measurementsError: {
        type: String,
        default: '',
    },
    isMobile: {
        type: Boolean,
        default: false,
    },
})

const { selectedStation, measurements, loadingMeasurements, measurementsError, isMobile } =
    toRefs(props)

const emit = defineEmits(['close', 'retry', 'close-sidebars'])

const activeRange = ref('7')

const filteredMeasurements = computed(() => {
    const sorted = [...props.measurements].sort(
        (a, b) => new Date(b.measuredAt) - new Date(a.measuredAt),
    )

    if (activeRange.value === 'all' || !sorted.length) {
        return sorted
    }

    const latestTime = new Date(sorted[0].measuredAt).getTime()
    const days = Number(activeRange.value)
    const from = latestTime - days * 24 * 60 * 60 * 1000

    return sorted.filter((measurement) => new Date(measurement.measuredAt).getTime() >= from)
})

const trendDelta = computed(() => {
    if (props.measurements.length < 2) return 0

    const sorted = [...props.measurements].sort(
        (a, b) => new Date(b.measuredAt) - new Date(a.measuredAt),
    )

    return Number(sorted[0].value) - Number(sorted[1].value)
})

const unit = computed(() => props.selectedStation?.latestMeasurement?.unit || 'м')

const trendDeltaText = computed(() => {
    const delta = trendDelta.value
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''

    return `${sign}${formatNumber(Math.abs(delta))} ${unit.value}`
})

const trend = computed(() => {
    if (props.measurements.length < 2) return 'stable'
    if (trendDelta.value > 0) return 'up'
    if (trendDelta.value < 0) return 'down'

    return 'stable'
})

const trendSymbol = computed(() => {
    if (trend.value === 'up') return '↗'
    if (trend.value === 'down') return '↘'

    return '→'
})

const trendText = computed(() => {
    if (props.measurements.length < 2) return 'Недостатньо даних'
    if (trend.value === 'up') return 'Рівень зростає'
    if (trend.value === 'down') return 'Рівень знижується'

    return 'Без змін'
})

const chartMinMax = computed(() => {
    const values = filteredMeasurements.value.map((item) => Number(item.value))

    if (!values.length) {
        return { min: '—', max: '—' }
    }

    return {
        min: formatNumber(Math.min(...values)),
        max: formatNumber(Math.max(...values)),
    }
})

const chartPoints = computed(() => {
    const chronological = [...filteredMeasurements.value].reverse()

    if (!chronological.length) return ''

    const values = chronological.map((item) => Number(item.value))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    return chronological
        .map((item, index) => {
            const x =
                chronological.length === 1 ? 260 : 12 + (index / (chronological.length - 1)) * 496

            const y = 138 - ((Number(item.value) - min) / range) * 126

            return `${x},${y}`
        })
        .join(' ')
})
</script>

<style scoped>
.station-sidebar {
    background: #fff;
    border: 1px solid #e5ece8;
    border-radius: 16px;
    overflow: hidden;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 20px;
}

.station-card {
    position: relative;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #dce7e1 transparent;
}

.station-card__title {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: #7d9a90;
    margin: 0 0 8px;
}

.station-card__name {
    font-size: 21px;
    margin: 0;
    font-weight: 800;
    color: #24483c;
    font-family: Manrope, sans-serif;
    letter-spacing: -0.6px;
}

.station-card__close {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border: 1px solid #e8efeb;
    border-radius: 9px;
    background: #fff;
    color: #80958c;
    line-height: 1;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease-in-out;
}

.station-card__close:hover {
    border-color: #dce8e2;
}

.station-card__river {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #719084;
    font-size: 11px;
    margin: 8px 0 0;

    span {
        color: #15987f;
        font-size: 17px;
    }
}

.station-card__current-level {
    padding: 16px;
    border-radius: 13px;
    background: linear-gradient(135deg, #126f5e, #188d76);
    color: #fff;
    box-shadow: 0 7px 15px rgba(21, 124, 105, 0.13);
    margin-top: 18px;
}

.station-card__current-level-top {
    font-size: 10px;
    color: #d2eee4;
}

.station-card__current-level-number {
    font-family: Manrope, sans-serif;
    font-size: 36px;
    letter-spacing: -1.6px;
    font-weight: 800;
    margin: 12px 0 7px;

    span {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0;
        color: #c4e7db;
    }
}

.station-card__current-level-bottom {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    color: #c2e6db;
}

.station-card__trend {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
}

.station-card__trend-icon {
    display: flex;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    font-size: 21px;
    background: #edf8f2;
    color: #168e78;
    flex-shrink: 0;
}

.station-card__trend-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    font-size: 9px;
    color: #99aaa2;

    span {
        font-size: 10px;
        color: #49675b;
        font-weight: 700;
    }
}

.station-card__trend-delta {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
}

.station-card__trend-delta.trend-up {
    color: #168e78;
}

.station-card__trend-delta.trend-down {
    color: #c7784a;
}

.station-card__trend-delta.trend-stable {
    color: #8b9c94;
}

.station-card__divider {
    height: 1px;
    background: #edf1ef;
    margin: 18px 0;
}

.station-card__chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 15px;

    h3 {
        font-size: 12px;
        margin: 0;
        color: #35564a;
        font-weight: 700;
    }

    p {
        font-size: 9px;
        color: #9aa9a2;
        margin: 4px 0 0;
    }
}

.station-card__range-switch {
    display: flex;
    align-items: center;
    padding: 3px;
    background: #f1f6f3;
    border-radius: 7px;
    gap: 2px;

    button {
        cursor: pointer;
        padding: 5px 6px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: #84978e;
        font-size: 8px;
        white-space: nowrap;
        min-width: 36px;
        transition: all 0.2s ease-in-out;
    }

    button.active {
        background: #fff;
        color: #168e78;
        box-shadow: 0 1px 4px #274a3a13;
        font-weight: 700;
    }
}

.station-card__chart-loading {
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #8ca097;
    font-size: 10px;
}

.station-card__chart-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 10px 18px;
    color: #82958b;

    p {
        font-size: 10px;
        line-height: 1.6;
        margin: 7px 0 12px;
    }
}

.station-card__button {
    cursor: pointer;
    padding: 9px 12px;
    border: 0;
    border-radius: 8px;
    background: #168e78;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
}

.station-card__chart-wrapper {
    position: relative;
    padding: 3px 0 0 30px;
}

.station-card__chart-labels {
    position: absolute;
    top: 5px;
    bottom: 20px;
    left: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #9aaca4;
    font-size: 8px;
}

.station-card__chart {
    width: 100%;
    height: 116px;
    overflow: visible;
    display: block;
}

.station-card__chart-dates {
    display: flex;
    justify-content: space-between;
    margin-top: 3px;
    color: #a0aea8;
    font-size: 8px;
}

.station-card__empty-chart {
    padding: 22px 20px;
    color: #99a9a2;
    font-size: 10px;
    text-align: center;
}

.station-card__history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    h3 {
        font-size: 12px;
        margin: 0;
        color: #35564a;
        font-weight: 700;
    }

    span {
        font-size: 9px;
        color: #9aaba3;
    }
}

.station-card__list {
    max-height: 260px;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: #dce7e1 transparent;
}

.station-card__list-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f3f1;
}

.station-card__list-row:last-child {
    border-bottom: 0;
}

.station-card__list-index {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #f2f7f4;
    color: #8aa197;
    font-size: 9px;
    font-weight: 700;
}

.station-card__list-date {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;

    strong {
        font-size: 10px;
        color: #506d61;
        font-weight: 600;
    }

    small {
        font-size: 9px;
        color: #a0aea8;
    }
}

.station-card__list-distance {
    font-family: Manrope, sans-serif;
    color: #288b74;
    font-size: 12px;
    font-weight: 800;

    small {
        font-size: 9px;
        color: #91a39a;
        font-weight: 500;
    }
}

.station-card-empty {
    margin: auto;
    text-align: center;
}

.station-card-empty__illustration {
    height: 145px;
    width: 170px;
    position: relative;
    display: grid;
    place-items: center;
    margin: 0 auto 18px;
}

.station-card-empty__orbit {
    position: absolute;
    border: 1px solid #d9eee4;
    border-radius: 50%;
    transform: rotate(-20deg);
}

.station-card-empty__orbit--one {
    width: 156px;
    height: 78px;
}

.station-card-empty__orbit--two {
    width: 126px;
    height: 112px;
    transform: rotate(48deg);
    border-color: #e5f1eb;
}

.station-card-empty__drop {
    width: 70px;
    height: 70px;
    display: grid;
    place-items: center;
    border-radius: 23px;
    background: linear-gradient(135deg, #e0f5eb, #f1faf5);
    box-shadow: 0 10px 24px rgba(90, 167, 139, 0.09);
    transform: rotate(-8deg);

    svg {
        width: 39px;
        fill: none;
        stroke: #198d75;
        stroke-width: 2.3;
        stroke-linecap: round;
    }
}

.station-card-empty__info {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    color: #7d9a90;
    margin: 0 0 8px;
}

.station-card-empty__title {
    font-family: Manrope, sans-serif;
    letter-spacing: -0.6px;
    margin: 0;
    color: #2a4e42;
    font-size: 22px;
}

.station-card-empty__description {
    font-size: 11px;
    line-height: 1.8;
    color: #82958c;
    margin: 12px auto 20px;
    max-width: 270px;
}

.station-card-empty__tip {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    text-align: left;
    padding: 13px;
    border-radius: 11px;
    background: #f3f9f5;
    width: 100%;
    max-width: 280px;
    line-height: 16px;

    > span {
        color: #168e78;
        font-size: 16px;
    }

    p {
        margin: 0;
        font-size: 10px;
        line-height: 1.7;
        color: #7c9187;

        span {
            color: #46675a;
            font-weight: 700;
        }
    }
}
</style>

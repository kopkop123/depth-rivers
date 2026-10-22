import { ref, onUnmounted } from 'vue'

async function requestJson(url, signal, retries = 2) {
    let lastError

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            const response = await fetch(url, {
                signal,
                headers: { Accept: 'application/json' },
            })

            if (response.status === 503 && attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** attempt))
                continue
            }

            if (!response.ok) {
                const error = new Error(
                    response.status === 503
                        ? 'Сервіс тимчасово недоступний. Спробуйте ще раз.'
                        : `Помилка запиту (${response.status}).`,
                )
                error.status = response.status
                throw error
            }

            return await response.json()
        } catch (error) {
            if (error.name === 'AbortError') throw error

            lastError = error

            if (error.status && error.status !== 503) throw error

            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, 350 * 2 ** attempt))
            }
        }
    }

    throw lastError || new Error('Не вдалося завантажити дані.')
}

export function useStations({
    getBoundsQuery,
    renderMarkers,
    fitStations,
    panToStation,
    onSelect,
}) {
    const stations = ref([])
    const selectedStation = ref(null)
    const selectedId = ref(null)
    const measurements = ref([])

    const loadingStations = ref(false)
    const loadingMeasurements = ref(false)
    const stationsError = ref('')
    const measurementsError = ref('')
    const mapNotice = ref('')
    const totalStations = ref(0)

    let lastParams = ''
    let stationRequestId = 0
    let measurementRequestId = 0
    let stationController
    let measurementController

    async function loadStations({ query = '', fit = false, append = false } = {}) {
        const requestId = ++stationRequestId

        stationController?.abort()
        stationController = new AbortController()

        loadingStations.value = true
        stationsError.value = ''
        mapNotice.value = ''

        let params

        if (append) {
            // Продовжуємо попередній запит (той самий bbox/search), а не поточну область карти
            params = new URLSearchParams(lastParams)
            params.set('cursor', String(stations.value.length))
        } else {
            params = new URLSearchParams({ limit: '100' })

            if (query) {
                params.set('search', query)
            } else {
                const boundsQuery = getBoundsQuery?.()

                if (boundsQuery) {
                    params.set('bbox', boundsQuery)
                }
            }

            lastParams = params.toString()
        }

        try {
            const result = await requestJson(`/api/stations?${params}`, stationController.signal)

            if (requestId !== stationRequestId) return

            const incoming = result.data || []

            if (append) {
                const known = new Set(stations.value.map((station) => station.id))
                stations.value = [
                    ...stations.value,
                    ...incoming.filter((station) => !known.has(station.id)),
                ]
            } else {
                stations.value = incoming
            }

            totalStations.value = result.pagination?.totalItems ?? stations.value.length

            if (!append && !stations.value.length) {
                mapNotice.value = query
                    ? 'За вашим запитом станцій не знайдено.'
                    : 'У цій області станцій не знайдено. Спробуйте змінити масштаб карти.'
            }

            renderMarkers?.()

            if (fit && !append && stations.value.length) {
                fitStations?.(stations.value)
            }
        } catch (error) {
            if (error.name !== 'AbortError' && requestId === stationRequestId) {
                const message = error.message || 'Не вдалося завантажити станції.'

                // Помилка догрузки не повинна стирати вже показаний список
                if (append) {
                    mapNotice.value = message
                } else {
                    stationsError.value = message
                }
            }
        } finally {
            if (requestId === stationRequestId) {
                loadingStations.value = false
            }
        }
    }

    async function selectStation(station, { pan = true } = {}) {
        selectedStation.value = station
        selectedId.value = station.id

        onSelect?.()
        renderMarkers?.()

        if (pan) {
            panToStation?.(station)
        }

        const requestId = ++measurementRequestId

        measurementController?.abort()
        measurementController = new AbortController()

        loadingMeasurements.value = true
        measurementsError.value = ''
        measurements.value = []

        try {
            const result = await requestJson(
                `/api/stations/${encodeURIComponent(station.id)}/measurements`,
                measurementController.signal,
            )

            if (requestId !== measurementRequestId) return

            measurements.value = [...(result.data || [])].sort(
                (a, b) => new Date(b.measuredAt) - new Date(a.measuredAt),
            )
        } catch (error) {
            if (error.name !== 'AbortError' && requestId === measurementRequestId) {
                measurementsError.value = error.message || 'Не вдалося завантажити вимірювання.'
            }
        } finally {
            if (requestId === measurementRequestId) {
                loadingMeasurements.value = false
            }
        }
    }

    function clearSelectedStation() {
        selectedStation.value = null
        selectedId.value = null
        measurements.value = []
        measurementsError.value = ''

        measurementRequestId += 1
        measurementController?.abort()
        loadingMeasurements.value = false

        renderMarkers?.()
    }

    function cancelRequests() {
        stationRequestId += 1
        measurementRequestId += 1

        stationController?.abort()
        measurementController?.abort()
    }

    onUnmounted(cancelRequests)

    return {
        stations,
        selectedStation,
        selectedId,
        measurements,
        loadingStations,
        loadingMeasurements,
        stationsError,
        measurementsError,
        mapNotice,
        totalStations,
        loadStations,
        selectStation,
        clearSelectedStation,
        cancelRequests,
    }
}

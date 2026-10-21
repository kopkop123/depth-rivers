export function escapeHtml(value = '') {
    return String(value).replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    )
}

export function formatNumber(value) {
    return Number(value).toLocaleString('uk-UA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function formatDate(value, options = { day: '2-digit', month: 'short' }) {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('uk-UA', options)
}

export function formatDateTime(value) {
    if (!value) return 'Немає даних'

    return new Date(value).toLocaleString('uk-UA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

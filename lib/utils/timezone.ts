/**
 * Obtiene la fecha/hora actual ajustada a la zona horaria de Bolivia (GMT-4).
 * Vercel funciona en UTC, por lo que restamos 4 horas para obtener la hora local de La Paz.
 */
export function getBolivianDate(): Date {
    const utcNow = new Date()
    const boliviaOffset = -4 * 60 // GMT-4 en minutos
    const localTime = new Date(utcNow.getTime() + boliviaOffset * 60 * 1000)
    return localTime
}

/**
 * Obtiene el inicio del día actual en Bolivia (00:00:00 GMT-4).
 */
export function getBolivianDayStart(): Date {
    const today = getBolivianDate()
    today.setHours(0, 0, 0, 0)
    return today
}

/**
 * Convierte una fecha local de Bolivia a UTC para queries a Supabase.
 */
export function toUTC(bolivianDate: Date): string {
    const utcTime = new Date(bolivianDate.getTime() - (-4 * 60 * 60 * 1000))
    return utcTime.toISOString()
}

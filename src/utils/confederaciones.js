export const CONFEDERACIONES = [
  {
    id:      'CONCACAF',
    label:   'CONCACAF',
    emoji:   '🌎',
    regiones: ['HN', 'CR', 'GT', 'SV', 'NI', 'PA', 'BZ', 'CONCACAF'],
  },
  {
    id:      'CONMEBOL',
    label:   'CONMEBOL',
    emoji:   '🌎',
    regiones: ['CO', 'AR', 'BR', 'UY', 'CL', 'PE', 'EC', 'BO', 'PY', 'VE', 'CONMEBOL'],
  },
  {
    id:      'UEFA',
    label:   'UEFA',
    emoji:   '🌍',
    regiones: ['ES', 'ENG', 'DE', 'IT', 'FR', 'PT', 'NL', 'BE', 'UEFA'],
  },
  {
    id:      'FIFA',
    label:   'FIFA',
    emoji:   '🌐',
    regiones: ['MUNDIAL'],
  },
]

/**
 * Filtra competencias por confederación
 */
export function filtrarPorConfederacion(competencias, confederacionId) {
  if (!confederacionId) return competencias
  const conf = CONFEDERACIONES.find(c => c.id === confederacionId)
  if (!conf) return competencias
  return competencias.filter(c => conf.regiones.includes(c.region))
}

/**
 * Extrae temporadas únicas de las jornadas de una competencia
 * y las ordena de más reciente a más antigua
 */
export function extraerTemporadas(matchdays) {
  const temps = [...new Set(matchdays.map(m => m.season).filter(Boolean))]
  return temps.sort((a, b) => b.localeCompare(a))
}

/**
 * Extrae torneos (Apertura/Clausura/único) de las jornadas de una temporada
 */
export function extraerTorneos(matchdays, season) {
  const deTemporada = matchdays.filter(m => m.season === season)
  const nombres = deTemporada.map(m => m.name)

  const tieneApertura = nombres.some(n => n.startsWith('Apertura'))
  const tieneClausura = nombres.some(n => n.startsWith('Clausura'))

  if (tieneApertura && tieneClausura) {
    return [
      { id: 'Apertura', label: 'Apertura' },
      { id: 'Clausura', label: 'Clausura' },
    ]
  }
  if (tieneApertura) return [{ id: 'Apertura', label: 'Apertura' }]
  if (tieneClausura) return [{ id: 'Clausura', label: 'Clausura' }]

  // Liga sin apertura/clausura — torneo único
  return [{ id: 'UNICO', label: 'Torneo completo' }]
}

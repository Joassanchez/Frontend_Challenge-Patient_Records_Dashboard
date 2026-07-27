/**
 * Normaliza un string: descompone diacríticos (NFD), elimina marcas,
 * y lo pasa a minúsculas. Útil para búsquedas insensibles a tildes y mayúsculas.
 */
function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Determina si un paciente matchea un término de búsqueda.
 * Busca en `name` y `description`, ignorando mayúsculas y diacríticos.
 */
export function matchesSearch(
  name: string,
  description: string,
  search: string,
): boolean {
  if (!search) return true;

  const normalizedSearch = normalizeForSearch(search);
  if (!normalizedSearch) return true;

  const haystack = normalizeForSearch(`${name} ${description}`);
  return haystack.includes(normalizedSearch);
}

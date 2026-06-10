const KEY = 'cg_favorites'

function getAll(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveAll(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

export function isFavorited(studyId: string): boolean {
  return getAll().includes(studyId)
}

export function toggleFavorite(studyId: string): boolean {
  const all = getAll()
  const idx = all.indexOf(studyId)
  if (idx >= 0) {
    all.splice(idx, 1)
    saveAll(all)
    return false
  } else {
    all.push(studyId)
    saveAll(all)
    return true
  }
}

export function getFavoriteIds(): string[] {
  return getAll()
}

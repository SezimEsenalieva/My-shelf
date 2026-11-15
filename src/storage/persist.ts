/**
 * Просим браузер не удалять наши данные, когда на телефоне мало места.
 * Safari может отказать — тогда данные всё равно хранятся, просто без «гарантии».
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

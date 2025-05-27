import { apiCache } from "./apiCache.js"

// Optimized fetch with caching and timeout
export const optimizedFetch = async (url, options = {}) => {
  const { cache = true, timeout = 10000, ...fetchOptions } = options

  // Check cache first for GET requests
  if (cache && (!fetchOptions.method || fetchOptions.method === "GET") && apiCache.has(url)) {
    return apiCache.get(url)
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Cache successful GET responses only
    if (cache && response.status === 200 && (!fetchOptions.method || fetchOptions.method === "GET")) {
      apiCache.set(url, data)
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      throw new Error("Request timeout")
    }
    throw error
  }
}

// Batch fetch utility for multiple requests
export const batchFetch = async (requests) => {
  try {
    const promises = requests.map(({ url, options }) => optimizedFetch(url, options).catch((error) => ({ error, url })))

    return await Promise.all(promises)
  } catch (error) {
    console.error("Batch fetch error:", error)
    throw error
  }
}

// Preload utility for critical resources
export const preloadResource = (url, options = {}) => {
  // Don't preload if already cached
  if (apiCache.has(url)) {
    return Promise.resolve(apiCache.get(url))
  }

  return optimizedFetch(url, { ...options, cache: true }).catch((error) => {
    console.warn("Preload failed for:", url, error)
    return null
  })
}

// Simple in-memory cache
const cache = new Map()
const timers = new Map()

const apiCache = {
  set(key, value, ttl = 5 * 60 * 1000) {
    // Clear existing timer
    if (timers.has(key)) {
      clearTimeout(timers.get(key))
    }

    // Set value
    cache.set(key, value)

    // Set expiration
    const timer = setTimeout(() => {
      cache.delete(key)
      timers.delete(key)
    }, ttl)

    timers.set(key, timer)
  },

  get(key) {
    return cache.get(key)
  },

  has(key) {
    return cache.has(key)
  },

  clear() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    cache.clear()
  },
}

// Optimized fetch with caching and timeout
export const optimizedFetch = async (url, options = {}) => {
  const { cache: useCache = true, timeout = 10000, ...fetchOptions } = options

  // Check cache first for GET requests
  if (useCache && (!fetchOptions.method || fetchOptions.method === "GET") && apiCache.has(url)) {
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
    if (useCache && response.status === 200 && (!fetchOptions.method || fetchOptions.method === "GET")) {
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

// Batch fetch utility
export const batchFetch = async (requests) => {
  const promises = requests.map(({ url, options }) => optimizedFetch(url, options).catch((error) => ({ error, url })))
  return Promise.all(promises)
}

// Clear cache utility
export const clearCache = () => {
  apiCache.clear()
}

// Simple in-memory cache with TTL (Time To Live)
class ApiCache {
  constructor() {
    this.cache = new Map()
    this.timers = new Map()
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    // Default 5 minutes TTL
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }

    // Set the value
    this.cache.set(key, value)

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  get(key) {
    return this.cache.get(key)
  }

  has(key) {
    return this.cache.has(key)
  }

  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }

    // Remove from cache
    this.cache.delete(key)
  }

  clear() {
    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer))
    this.timers.clear()

    // Clear cache
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// Create and export a singleton instance
export const apiCache = new ApiCache()

// Export the class for testing purposes
export { ApiCache }

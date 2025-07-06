import { useState, useEffect } from 'react'

// Simple cache utility to prevent duplicate API calls
export class APICache {
  private static cache = new Map<string, unknown>()
  private static expiryTimes = new Map<string, number>()
  private static activeFetches = new Map<string, Promise<unknown>>()
  
  static get(key: string): unknown | null {
    const now = Date.now()
    const expiry = this.expiryTimes.get(key)
    
    if (expiry && now > expiry) {
      this.cache.delete(key)
      this.expiryTimes.delete(key)
      return null
    }
    
    return this.cache.get(key) || null
  }
  
  static set(key: string, data: unknown, ttlMinutes: number = 5): void {
    this.cache.set(key, data)
    this.expiryTimes.set(key, Date.now() + (ttlMinutes * 60 * 1000))
  }
  
  static clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
      this.expiryTimes.delete(key)
      this.activeFetches.delete(key)
    } else {
      this.cache.clear()
      this.expiryTimes.clear()
      this.activeFetches.clear()
    }
  }
  
  static async fetch(url: string, ttlMinutes: number = 5): Promise<unknown> {
    // Check if we're already fetching this URL
    const activeFetch = this.activeFetches.get(url)
    if (activeFetch) {
      return activeFetch
    }
    
    // Check cache first
    const cached = this.get(url)
    if (cached) {
      return cached
    }
    
    // Create new fetch promise
    const fetchPromise = fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        this.set(url, data, ttlMinutes)
        this.activeFetches.delete(url)
        return data
      })
      .catch(error => {
        this.activeFetches.delete(url)
        throw error
      })
    
    this.activeFetches.set(url, fetchPromise)
    return fetchPromise
  }
}

// Hook for cached API calls
export function useCachedAPI<T>(
  url: string, 
  dependencies: any[] = [],
  ttlMinutes: number = 5
): { data: T | null, loading: boolean, error: string | null, refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchData = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      APICache.clear(url)
    }
    
    try {
      setLoading(true)
      const result = await APICache.fetch(url, ttlMinutes)
      setData(result as T)
      setError(null)
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }
  
  const refetch = async () => {
    await fetchData(true)
  }
  
  useEffect(() => {
    fetchData()
  }, dependencies)
  
  return { data, loading, error, refetch }
}

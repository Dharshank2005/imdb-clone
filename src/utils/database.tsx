// Database integration utilities with fallback to local storage
interface DatabaseConfig {
  apiUrl?: string
  apiKey?: string
  useLocalStorage?: boolean
}

class DatabaseManager {
  private config: DatabaseConfig
  private isOnline: boolean = navigator.onLine

  constructor(config: DatabaseConfig = {}) {
    this.config = {
      useLocalStorage: true,
      ...config,
    }

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.syncLocalChanges()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  // Generic CRUD operations with proper typing
  async create<T extends Record<string, any>>(collection: string, data: T): Promise<T & { id: string }> {
    try {
      if (this.isOnline && this.config.apiUrl) {
        const response = await fetch(`${this.config.apiUrl}/${collection}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error("Network request failed")

        const result = (await response.json()) as T & { id: string }

        // Also save to local storage as backup
        this.saveToLocalStorage(collection, result)

        return result
      } else {
        // Fallback to local storage
        return this.createInLocalStorage(collection, data)
      }
    } catch (error) {
      console.warn("Database create failed, using local storage:", error)
      return this.createInLocalStorage(collection, data)
    }
  }

  async readSingle<T>(collection: string, id: string): Promise<T | null> {
    try {
      if (this.isOnline && this.config.apiUrl) {
        const response = await fetch(`${this.config.apiUrl}/${collection}/${id}`, {
          headers: {
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            return null
          }
          throw new Error("Network request failed")
        }

        const result = (await response.json()) as T

        // Cache in local storage
        this.saveToLocalStorage(`${collection}_${id}`, result)

        return result
      } else {
        // Fallback to local storage
        return this.readSingleFromLocalStorage<T>(collection, id)
      }
    } catch (error) {
      console.warn("Database read failed, using local storage:", error)
      return this.readSingleFromLocalStorage<T>(collection, id)
    }
  }

  async readMany<T>(collection: string): Promise<T[]> {
    try {
      if (this.isOnline && this.config.apiUrl) {
        const response = await fetch(`${this.config.apiUrl}/${collection}`, {
          headers: {
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
        })

        if (!response.ok) throw new Error("Network request failed")

        const result = (await response.json()) as T[]

        // Cache in local storage
        this.saveToLocalStorage(collection, result)

        return result
      } else {
        // Fallback to local storage
        return this.readManyFromLocalStorage<T>(collection)
      }
    } catch (error) {
      console.warn("Database read failed, using local storage:", error)
      return this.readManyFromLocalStorage<T>(collection)
    }
  }

  async update<T extends Record<string, any>>(collection: string, id: string, data: Partial<T>): Promise<T> {
    try {
      if (this.isOnline && this.config.apiUrl) {
        const response = await fetch(`${this.config.apiUrl}/${collection}/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error("Network request failed")

        const result = (await response.json()) as T

        // Update local storage
        this.saveToLocalStorage(`${collection}_${id}`, result)

        return result
      } else {
        // Fallback to local storage
        return this.updateInLocalStorage<T>(collection, id, data)
      }
    } catch (error) {
      console.warn("Database update failed, using local storage:", error)
      return this.updateInLocalStorage<T>(collection, id, data)
    }
  }

  async delete(collection: string, id: string): Promise<boolean> {
    try {
      if (this.isOnline && this.config.apiUrl) {
        const response = await fetch(`${this.config.apiUrl}/${collection}/${id}`, {
          method: "DELETE",
          headers: {
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
        })

        if (!response.ok) throw new Error("Network request failed")

        // Remove from local storage
        this.removeFromLocalStorage(`${collection}_${id}`)

        return true
      } else {
        // Fallback to local storage
        return this.deleteFromLocalStorage(collection, id)
      }
    } catch (error) {
      console.warn("Database delete failed, using local storage:", error)
      return this.deleteFromLocalStorage(collection, id)
    }
  }

  // Local storage operations with proper typing
  private createInLocalStorage<T extends Record<string, any>>(collection: string, data: T): T & { id: string } {
    const id = Date.now().toString()
    const item = { ...data, id } as T & { id: string }

    const existing = this.getFromLocalStorage<(T & { id: string })[]>(collection, [])
    const updated = [...existing, item]

    this.saveToLocalStorage(collection, updated)
    return item
  }

  private readSingleFromLocalStorage<T>(collection: string, id: string): T | null {
    return this.getFromLocalStorage<T | null>(`${collection}_${id}`, null)
  }

  private readManyFromLocalStorage<T>(collection: string): T[] {
    return this.getFromLocalStorage<T[]>(collection, [])
  }

  private updateInLocalStorage<T extends Record<string, any>>(collection: string, id: string, data: Partial<T>): T {
    const existing = this.getFromLocalStorage<(T & { id: string })[]>(collection, [])
    const index = existing.findIndex((item) => item.id === id)

    if (index !== -1) {
      existing[index] = { ...existing[index], ...data } as T & { id: string }
      this.saveToLocalStorage(collection, existing)
      return existing[index] as T
    }

    throw new Error("Item not found")
  }

  private deleteFromLocalStorage(collection: string, id: string): boolean {
    const existing = this.getFromLocalStorage<{ id: string }[]>(collection, [])
    const filtered = existing.filter((item) => item.id !== id)

    this.saveToLocalStorage(collection, filtered)
    this.removeFromLocalStorage(`${collection}_${id}`)

    return true
  }

  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`db_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`db_${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Failed to read from localStorage:", error)
      return defaultValue
    }
  }

  private removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(`db_${key}`)
    } catch (error) {
      console.error("Failed to remove from localStorage:", error)
    }
  }

  // Sync local changes when coming back online
  private async syncLocalChanges(): Promise<void> {
    if (!this.config.apiUrl) return

    try {
      // Get all pending changes from localStorage
      const pendingChanges = this.getFromLocalStorage<any[]>("pending_changes", [])

      for (const change of pendingChanges) {
        try {
          switch (change.operation) {
            case "create":
              await this.create(change.collection, change.data)
              break
            case "update":
              await this.update(change.collection, change.id, change.data)
              break
            case "delete":
              await this.delete(change.collection, change.id)
              break
          }
        } catch (error) {
          console.error("Failed to sync change:", error)
        }
      }

      // Clear pending changes
      this.removeFromLocalStorage("pending_changes")
    } catch (error) {
      console.error("Failed to sync local changes:", error)
    }
  }

  // Queue changes for later sync when offline
  private queueChange(operation: string, collection: string, id?: string, data?: any): void {
    const pendingChanges = this.getFromLocalStorage<any[]>("pending_changes", [])
    pendingChanges.push({
      operation,
      collection,
      id,
      data,
      timestamp: Date.now(),
    })
    this.saveToLocalStorage("pending_changes", pendingChanges)
  }
}

// Export singleton instance
export const db = new DatabaseManager({
  // Configure with your database settings
  // apiUrl: process.env.NEXT_PUBLIC_API_URL,
  // apiKey: process.env.NEXT_PUBLIC_API_KEY,
  useLocalStorage: true,
})

// Define proper types for our data structures
interface UserProfile {
  id?: string
  username: string
  email: string
  bio: string
  profilePicture: string
  preferences: {
    favoriteGenres: string[]
    notifications: Record<string, boolean>
  }
  joinDate: string
}

interface Movie {
  id: string
  title: string
  image: string
  year: number
}

interface Review {
  id: string
  movieId: string
  title: string
  content: string
  rating: number
  tags?: string[]
  createdAt: string
  updatedAt?: string
}

// Utility functions for common operations with proper typing
export const dbUtils = {
  // User profile operations
  async saveUserProfile(profile: UserProfile): Promise<UserProfile> {
    return await db.update<UserProfile>("user_profiles", "current_user", profile)
  },

  async getUserProfile(): Promise<UserProfile | null> {
    return await db.readSingle<UserProfile>("user_profiles", "current_user")
  },

  // Watchlist operations
  async saveWatchlist(watchlist: Movie[]): Promise<{ items: Movie[] }> {
    return await db.update<{ items: Movie[] }>("watchlists", "current_user", { items: watchlist })
  },

  async getWatchlist(): Promise<Movie[]> {
    const result = await db.readSingle<{ items: Movie[] }>("watchlists", "current_user")
    return result?.items || []
  },

  // Rated movies operations
  async saveRatedMovies(ratedMovies: Movie[]): Promise<{ items: Movie[] }> {
    return await db.update<{ items: Movie[] }>("rated_movies", "current_user", { items: ratedMovies })
  },

  async getRatedMovies(): Promise<Movie[]> {
    const result = await db.readSingle<{ items: Movie[] }>("rated_movies", "current_user")
    return result?.items || []
  },

  // Reviews operations
  async saveReview(review: Omit<Review, "id">): Promise<Review> {
    return await db.create<Omit<Review, "id">>("reviews", review)
  },

  async updateReview(reviewId: string, review: Partial<Review>): Promise<Review> {
    return await db.update<Review>("reviews", reviewId, review)
  },

  async deleteReview(reviewId: string): Promise<boolean> {
    return await db.delete("reviews", reviewId)
  },

  async getReviews(): Promise<Review[]> {
    return await db.readMany<Review>("reviews")
  },
}

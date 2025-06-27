export const STORAGE_KEYS = {
  USER_PROFILE: "moviedb_user_profile",
  WATCHLIST: "moviedb_watchlist",
  RATED_MOVIES: "moviedb_rated_movies",
  REVIEWS: "moviedb_reviews",
}

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error)
    return defaultValue
  }
}

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error)
    return false
  }
}

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error)
    return false
  }
}

export const getDefaultUserProfile = () => ({
  id: "user_1",
  username: "Movie Enthusiast",
  email: "user@moviedb.com",
  profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  bio: "Passionate about cinema and storytelling.",
  joinDate: new Date().toISOString(),
  preferences: {
    favoriteGenres: ["Action", "Drama", "Sci-Fi"],
    preferredLanguage: "English",
    notifications: {
      newReleases: true,
      recommendations: true,
      reviews: false,
    },
  },
  stats: {
    moviesWatched: 0,
    reviewsWritten: 0,
    averageRating: 0,
  },
})

export const initializeUserData = () => {
  if (!loadFromStorage(STORAGE_KEYS.USER_PROFILE)) {
    saveToStorage(STORAGE_KEYS.USER_PROFILE, getDefaultUserProfile())
  }
  if (!loadFromStorage(STORAGE_KEYS.WATCHLIST)) {
    saveToStorage(STORAGE_KEYS.WATCHLIST, [])
  }
  if (!loadFromStorage(STORAGE_KEYS.RATED_MOVIES)) {
    saveToStorage(STORAGE_KEYS.RATED_MOVIES, [])
  }
  if (!loadFromStorage(STORAGE_KEYS.REVIEWS)) {
    saveToStorage(STORAGE_KEYS.REVIEWS, [])
  }
}

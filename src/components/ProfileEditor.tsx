"use client"

import type React from "react"
import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Save, X, User, Mail, FileText, Settings, Eye, AlertCircle, CheckCircle } from "lucide-react"

// Define the shape of preferences
type Preferences = {
  favoriteGenres: string[]
  notifications: Record<string, boolean>
}

// Define the user profile interface
export interface UserProfile {
  username: string
  email: string
  bio: string
  profilePicture: string
  preferences: Preferences
  joinDate: string
}

// Define the component props interface
interface ProfileEditorProps {
  userProfile: UserProfile
  onSave: (updatedProfile: UserProfile) => void
  onCancel: () => void
}

const ProfileEditorEnhanced: React.FC<ProfileEditorProps> = ({ userProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>({
    username: userProfile.username,
    email: userProfile.email,
    bio: userProfile.bio,
    profilePicture: userProfile.profilePicture,
    preferences: { ...userProfile.preferences },
    joinDate: userProfile.joinDate,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validFields, setValidFields] = useState<Record<string, boolean>>({})
  const [previewImage, setPreviewImage] = useState<string>(userProfile.profilePicture)
  const [showPreview, setShowPreview] = useState(false)
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Real-time validation
  const validateField = (field: keyof UserProfile, value: string): { isValid: boolean; error: string } => {
    switch (field) {
      case "username":
        if (!value.trim()) return { isValid: false, error: "Username is required" }
        if (value.length < 3) return { isValid: false, error: "Username must be at least 3 characters" }
        if (value.length > 20) return { isValid: false, error: "Username must be less than 20 characters" }
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return { isValid: false, error: "Username can only contain letters, numbers, and underscores" }
        return { isValid: true, error: "" }

      case "email":
        if (!value.trim()) return { isValid: false, error: "Email is required" }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return { isValid: false, error: "Please enter a valid email address" }
        return { isValid: true, error: "" }

      case "bio":
        if (value.length > 500) return { isValid: false, error: "Bio must be less than 500 characters" }
        return { isValid: true, error: "" }

      default:
        return { isValid: true, error: "" }
    }
  }

  // Real-time validation with debounce
  useEffect(() => {
    const timeouts: Record<string, NodeJS.Timeout> = {}

    Object.keys(formData).forEach((key) => {
      if (key === "username" || key === "email" || key === "bio") {
        const field = key as keyof UserProfile
        const value = formData[field] as string

        setIsValidating((prev) => ({ ...prev, [field]: true }))

        timeouts[field] = setTimeout(() => {
          const validation = validateField(field, value)
          setErrors((prev) => ({ ...prev, [field]: validation.error }))
          setValidFields((prev) => ({ ...prev, [field]: validation.isValid }))
          setIsValidating((prev) => ({ ...prev, [field]: false }))
        }, 300)
      }
    })

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout))
    }
  }, [formData])

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as UserProfile)
  }

  const handlePreferenceChange = (category: keyof Preferences, field: string | null, value: any) => {
    setFormData((prev) => {
      const current = prev.preferences[category]
      let updated: any

      if (Array.isArray(current)) {
        updated = value
      } else if (current && typeof current === "object") {
        updated = { ...current, [field as string]: value }
      } else {
        updated = value
      }

      return {
        ...prev,
        preferences: { ...prev.preferences, [category]: updated } as Preferences,
      }
    })
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePicture: "Image size must be less than 5MB" }))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setPreviewImage(imageUrl)
        setFormData((prev) => ({ ...prev, profilePicture: imageUrl }) as UserProfile)
        setErrors((prev) => ({ ...prev, profilePicture: "" }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Final validation
    const finalErrors: Record<string, string> = {}
    ;["username", "email", "bio"].forEach((field) => {
      const validation = validateField(field as keyof UserProfile, formData[field as keyof UserProfile] as string)
      if (!validation.isValid) {
        finalErrors[field] = validation.error
      }
    })

    if (Object.keys(finalErrors).length === 0) {
      onSave({ ...userProfile, ...formData })
    } else {
      setErrors(finalErrors)
    }
  }

  const isFormValid =
    Object.values(validFields).every(Boolean) && ["username", "email"].every((field) => validFields[field])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Eye size={20} />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-2 rounded-full hover:bg-yellow-400 transition-colors"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-400">Click the camera icon to upload a new image (max 5MB)</p>
                {errors.profilePicture && <p className="text-red-500 text-sm mt-1">{errors.profilePicture}</p>}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User size={16} className="inline mr-2" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.username ? "border-red-500" : validFields.username ? "border-green-500" : "border-gray-700"
                    }`}
                    placeholder="Enter your username"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidating.username ? (
                      <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                    ) : errors.username ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : validFields.username ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : null}
                  </div>
                </div>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      errors.email ? "border-red-500" : validFields.email ? "border-green-500" : "border-gray-700"
                    }`}
                    placeholder="Enter your email"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidating.email ? (
                      <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                    ) : errors.email ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : validFields.email ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : null}
                  </div>
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText size={16} className="inline mr-2" />
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={4}
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
                  errors.bio ? "border-red-500" : validFields.bio !== false ? "border-gray-700" : "border-green-500"
                }`}
                placeholder="Tell us about yourself..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                <p className={`text-sm ml-auto ${formData.bio.length > 450 ? "text-red-400" : "text-gray-400"}`}>
                  {formData.bio.length}/500
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings size={20} className="mr-2" /> Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Favorite Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {["Action", "Comedy", "Drama", "Horror", "Romance", "Sci-Fi", "Thriller"].map((genre) => (
                      <motion.button
                        key={genre}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const currentGenres = formData.preferences.favoriteGenres || []
                          const newGenres = currentGenres.includes(genre)
                            ? currentGenres.filter((g) => g !== genre)
                            : [...currentGenres, genre]
                          handlePreferenceChange("favoriteGenres", null, newGenres)
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.preferences.favoriteGenres?.includes(genre)
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notifications</label>
                  <div className="space-y-2">
                    {Object.entries(formData.preferences.notifications || {}).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePreferenceChange("notifications", key, e.target.checked)}
                          className="rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isFormValid
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Save size={20} /> Save Changes
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                {" "}
                Cancel
              </button>
            </div>
          </form>

          {/* Preview Section */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-800/50 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                    />
                    <div>
                      <h4 className="text-xl font-bold">{formData.username || "Username"}</h4>
                      <p className="text-gray-300 text-sm">{formData.email || "email@example.com"}</p>
                      <p className="text-gray-400 text-sm mt-1">{formData.bio || "Your bio will appear here..."}</p>
                    </div>
                  </div>

                  {formData.preferences.favoriteGenres?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Favorite Genres:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.preferences.favoriteGenres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs border border-yellow-500/30"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProfileEditorEnhanced

// Helper functions for API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Generic fetch function with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle unauthorized
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    throw new Error("Unauthorized")
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// Blog API functions
export const blogApi = {
  // Get all blogs for the user
  getBlogs: async (status?: "draft" | "published") => {
    const query = status ? `?status=${status}` : ""
    return fetchWithAuth(`/api/blogs${query}`)
  },

  // Get a single blog by ID
  getBlog: async (id: string) => {
    return fetchWithAuth(`/api/blogs/${id}`)
  },

  // Save a blog as draft
  saveDraft: async (blog: any) => {
    return fetchWithAuth("/api/blogs/save-draft", {
      method: "POST",
      body: JSON.stringify(blog),
    })
  },

  // Publish a blog
  publishBlog: async (blog: any) => {
    return fetchWithAuth("/api/blogs/publish", {
      method: "POST",
      body: JSON.stringify(blog),
    })
  },
}

// Auth API functions
export const authApi = {
  // Register a new user
  register: async (name: string, email: string, password: string) => {
    return fetchWithAuth("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },

  // Login a user
  login: async (email: string, password: string) => {
    return fetchWithAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  // Get current user
  getMe: async () => {
    return fetchWithAuth("/api/auth/me")
  },
}

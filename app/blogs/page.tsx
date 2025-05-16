"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { PenLine } from "lucide-react"
import BlogList from "@/components/blog-list"
import { blogApi } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function BlogsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      fetchBlogs()
    }
  }, [isAuthenticated, loading, router])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const data = await blogApi.getBlogs()
      setBlogs(data)
    } catch (error) {
      console.error("Error fetching blogs:", error)
      toast.error("Failed to load blogs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBlog = (id: string) => {
    // Filter out the deleted blog
    setBlogs(blogs.filter((blog: any) => blog.id !== id))
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Blogs</h1>
        <Button asChild>
          <Link href="/editor" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            New Blog
          </Link>
        </Button>
      </div>

      <BlogList blogs={blogs} onDelete={handleDeleteBlog} />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import BlogEditor from "@/components/blog-editor"
import { blogApi } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function EditBlogPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  const [blog, setBlog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && blogId) {
      setIsLoading(true)
      blogApi
        .getBlog(blogId)
        .then((data) => {
          setBlog(data)
        })
        .catch((error) => {
          console.error("Error fetching blog:", error)
          toast.error("Failed to load blog")
          router.push("/blogs")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [blogId, isAuthenticated, loading, router])

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!blog && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <p>Blog not found</p>
      </div>
    )
  }

  const initialData = blog
    ? {
        title: blog.title,
        content: blog.content,
        tags: blog.tags.join(", "),
      }
    : undefined

  return <BlogEditor blogId={blogId} initialData={initialData} />
}

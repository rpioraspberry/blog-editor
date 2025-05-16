"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"

type Blog = {
  id: string
  title: string
  content: string
  tags: string[]
  status: "draft" | "published"
  created_at: string
  updated_at: string
}

type BlogListProps = {
  blogs: Blog[]
  onDelete: (id: string) => void
}

export default function BlogList({ blogs, onDelete }: BlogListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all")

  const filteredBlogs = blogs.filter((blog) => {
    if (activeTab === "all") return true
    if (activeTab === "published") return blog.status === "published"
    if (activeTab === "drafts") return blog.status === "draft"
    return true
  })

  const handleEdit = (id: string) => {
    router.push(`/editor/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        // Call delete API (to be implemented)
        onDelete(id)
        toast.success("Blog deleted successfully")
      } catch (error) {
        toast.error("Failed to delete blog")
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {renderBlogList(filteredBlogs)}
        </TabsContent>
        <TabsContent value="published" className="mt-6">
          {renderBlogList(filteredBlogs)}
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          {renderBlogList(filteredBlogs)}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderBlogList(blogs: Blog[]) {
    if (blogs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blogs found</p>
          <Button asChild className="mt-4">
            <Link href="/editor">Create New Blog</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <Card key={blog.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2 hover:underline">
                <Link href={`/editor/${blog.id}`}>{blog.title}</Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant={blog.status === "published" ? "default" : "outline"}>
                  {blog.status === "published" ? "Published" : "Draft"}
                </Badge>
                <span className="text-xs">{formatDate(blog.updated_at || blog.created_at)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="line-clamp-3 text-sm text-muted-foreground">
                {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => handleEdit(blog.id)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(blog.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }
}

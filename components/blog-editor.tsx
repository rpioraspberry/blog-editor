"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { debounce } from "lodash"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { blogApi } from "@/lib/api"
import { Loader2, Save } from "lucide-react"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

type BlogEditorProps = {
  blogId?: string
  initialData?: {
    title: string
    content: string
    tags: string
  }
}

export default function BlogEditor({ blogId, initialData }: BlogEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [tags, setTags] = useState(initialData?.tags || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Save draft function
  const saveDraft = useCallback(async () => {
    if (!title.trim()) return

    try {
      setIsSaving(true)
      const blogData = {
        id: blogId,
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      await blogApi.saveDraft(blogData)
      setLastSaved(new Date())

      // If this is a new blog, redirect to the edit URL with the new ID
      if (!blogId && blogData.id) {
        router.push(`/editor/${blogData.id}`)
      }

      return true
    } catch (error) {
      console.error("Error saving draft:", error)
      toast.error("Failed to save draft")
      return false
    } finally {
      setIsSaving(false)
    }
  }, [blogId, title, content, tags, router])

  // Debounced save for auto-save after typing stops
  const debouncedSave = useCallback(
    debounce(async () => {
      if (title.trim()) {
        const success = await saveDraft()
        if (success) {
          toast.success("Draft auto-saved")
        }
      }
    }, 5000),
    [saveDraft],
  )

  // Auto-save on content change
  useEffect(() => {
    if (title.trim()) {
      debouncedSave()
    }

    return () => {
      debouncedSave.cancel()
    }
  }, [title, content, tags, debouncedSave])

  // Set up interval for auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim()) {
        saveDraft().then((success) => {
          if (success) {
            toast.success("Draft auto-saved")
          }
        })
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [title, saveDraft])

  // Publish blog
  const publishBlog = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    try {
      setIsPublishing(true)
      await blogApi.publishBlog({
        id: blogId,
        title,
        content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })

      toast.success("Blog published successfully")
      router.push("/blogs")
    } catch (error) {
      console.error("Error publishing blog:", error)
      toast.error("Failed to publish blog")
    } finally {
      setIsPublishing(false)
    }
  }

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter blog title"
                    className="text-xl font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <Label htmlFor="editor">Content</Label>
                  <div className="min-h-[400px] border rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={modules}
                      placeholder="Write your blog content here..."
                      className="h-[350px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tech, programming, web"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={saveDraft} variant="outline" className="w-full" disabled={isSaving || !title.trim()}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>

                <Button
                  onClick={publishBlog}
                  className="w-full"
                  disabled={isPublishing || !title.trim() || !content.trim()}
                >
                  {isPublishing ? "Publishing..." : "Publish"}
                </Button>
              </div>

              {lastSaved && (
                <p className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

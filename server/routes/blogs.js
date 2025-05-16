import express from "express"
import mongoose from "mongoose"
import Blog from "../models/Blog.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

// Get all blogs for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query

    const query = { userId: req.user.id }

    if (status && ["draft", "published"].includes(status)) {
      query.status = status
    }

    const blogs = await Blog.find(query).sort({ updated_at: -1 })

    res.json(blogs)
  } catch (error) {
    console.error("Get blogs error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a single blog by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    res.json(blog)
  } catch (error) {
    console.error("Get blog error:", error)

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid blog ID" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// Save a blog as draft
router.post("/save-draft", auth, async (req, res) => {
  try {
    const { id, title, content, tags } = req.body

    if (!title) {
      return res.status(400).json({ message: "Title is required" })
    }

    let blog

    if (id) {
      // Update existing blog
      blog = await Blog.findOne({
        _id: id,
        userId: req.user.id,
      })

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" })
      }

      blog.title = title
      blog.content = content
      blog.tags = tags
    } else {
      // Create new blog
      blog = new Blog({
        title,
        content,
        tags,
        status: "draft",
        userId: req.user.id,
      })
    }

    await blog.save()

    res.json(blog)
  } catch (error) {
    console.error("Save draft error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Publish a blog
router.post("/publish", auth, async (req, res) => {
  try {
    const { id, title, content, tags } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" })
    }

    let blog

    if (id) {
      // Update existing blog
      blog = await Blog.findOne({
        _id: id,
        userId: req.user.id,
      })

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" })
      }

      blog.title = title
      blog.content = content
      blog.tags = tags
    } else {
      // Create new blog
      blog = new Blog({
        title,
        content,
        tags,
        userId: req.user.id,
      })
    }

    blog.status = "published"
    await blog.save()

    res.json(blog)
  } catch (error) {
    console.error("Publish blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a blog
router.delete("/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    res.json({ message: "Blog deleted successfully" })
  } catch (error) {
    console.error("Delete blog error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router

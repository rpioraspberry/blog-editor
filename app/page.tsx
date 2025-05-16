import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Welcome to the Blog Editor</h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Create, edit, and publish your blog posts with our modern editor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg">
            <Link href="/editor">Start Writing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/blogs">View Your Blogs</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, type FormEvent } from "react"
import { MessageCircle, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!WEB3FORMS_ACCESS_KEY) {
      toast.error("Feedback form is not configured. Please try again later.")
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append("access_key", WEB3FORMS_ACCESS_KEY)
    formData.append("subject", "New feedback from CSV Analytics")

    setSubmitting(true)
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Thanks! Your feedback has been sent.")
        form.reset()
        setOpen(false)
      } else {
        toast.error(data.message || "Something went wrong. Please try again.")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        aria-label="Send feedback"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative w-full max-w-md border-zinc-800 bg-zinc-900 p-6">
            <Button
              onClick={() => setOpen(false)}
              size="sm"
              variant="ghost"
              className="absolute right-4 top-4 h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-zinc-100">Send feedback</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Ran into an issue or have a suggestion? Let us know below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="feedback-email" className="text-sm text-zinc-300">
                  Email (optional)
                </label>
                <Input id="feedback-email" name="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="feedback-message" className="text-sm text-zinc-300">
                  Message
                </label>
                <Textarea
                  id="feedback-message"
                  name="message"
                  placeholder="Describe the issue or feedback..."
                  required
                  rows={5}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send feedback"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}

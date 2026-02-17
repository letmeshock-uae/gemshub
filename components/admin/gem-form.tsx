"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { gemFormSchema, type GemFormValues } from "@/lib/gem-schema"
import type { Gem } from "@/lib/gems-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "@phosphor-icons/react"
import Link from "next/link"
import { IconPicker } from "@/components/admin/icon-picker"
interface GemFormProps {
  gem?: Gem
}

export function GemForm({ gem }: GemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!gem

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GemFormValues>({
    resolver: zodResolver(gemFormSchema),
    defaultValues: {
      title: gem?.title ?? "",
      description: gem?.description ?? "",
      url: gem?.url ?? "",
      previewImageUrl: gem?.previewImageUrl ?? "",
      published: gem?.published ?? true,
    },
  })

  const previewUrl = watch("previewImageUrl")
  const published = watch("published")

  async function onSubmit(data: GemFormValues) {
    setIsSubmitting(true)
    try {
      if (isEditing && gem) {
        const res = await fetch(`/api/gems/${gem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to update")
        toast.success("Gem updated successfully.")
      } else {
        const res = await fetch("/api/gems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Failed to create")
        toast.success("Gem created successfully.")
      }
      router.push("/admin")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? "Edit Gem" : "Create New Gem"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">Gem Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Email Draft Writer"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch("title")?.length ?? 0}/80 characters
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="A short description of what this gem does..."
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch("description")?.length ?? 0}/180 characters
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="url">
                Gem URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                placeholder="https://gemini.google.com/gem/..."
                {...register("url")}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="previewImageUrl">
                Preview Image URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="previewImageUrl"
                placeholder="https://... or /images/preview.png"
                {...register("previewImageUrl")}
              />
              {errors.previewImageUrl && (
                <p className="text-xs text-destructive">
                  {errors.previewImageUrl.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Icon <span className="text-destructive">*</span></Label>
              <IconPicker
                value={watch("icon")}
                onChange={(val) => setValue("icon", val)}
              />
              {!watch("icon") && (
                <p className="text-xs text-muted-foreground">Select an icon for the card.</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="published" className="cursor-pointer">
                  Published
                </Label>
                <p className="text-xs text-muted-foreground">
                  Make this gem visible on the public page
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={(checked) => setValue("published", checked)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Gem"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="w-full lg:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ; (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {watch("title") || "Gem Title"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {watch("description") || "Description will appear here."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

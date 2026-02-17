"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "sonner"
import type { Gem } from "@/lib/gems-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  DownloadSimple,
} from "@phosphor-icons/react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GemTable() {
  const router = useRouter()
  const { data: gems, mutate, isLoading } = useSWR<Gem[]>("/api/gems", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
  const [deleteTarget, setDeleteTarget] = useState<Gem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleToggle(id: string) {
    await fetch(`/api/gems/${id}/toggle`, { method: "PATCH" })
    mutate()
    toast.success("Published status updated.")
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    await fetch(`/api/gems/${deleteTarget.id}`, { method: "DELETE" })
    mutate()
    toast.success("Gem deleted successfully.")
    setDeleteTarget(null)
    setIsDeleting(false)
  }

  function handleDownload() {
    window.open("/api/gems/download", "_blank")
    toast.success("Downloading gems.json")
  }

  if (isLoading || !gems) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Gems</h2>
          <p className="text-sm text-muted-foreground">
            {gems.length} gem{gems.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <DownloadSimple className="mr-1.5 h-4 w-4" />
            Download JSON
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Gem
            </Link>
          </Button>
        </div>
      </div>

      {gems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">No gems yet.</p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/admin/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create your first gem
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-48 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gems.map((gem) => (
                <TableRow
                  key={gem.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/admin/${gem.id}/edit`)}
                >
                  <TableCell>
                    <div className="h-9 w-14 overflow-hidden rounded bg-muted">
                      <img
                        src={gem.previewImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {gem.title}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {gem.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={gem.published ? "default" : "secondary"}>
                      {gem.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggle(gem.id)
                        }}
                        title={gem.published ? "Unpublish" : "Publish"}
                      >
                        {gem.published ? (
                          <EyeSlash className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {gem.published ? "Unpublish" : "Publish"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/${gem.id}/edit`}>
                          <PencilSimple className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(gem)
                        }}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gem</DialogTitle>
            <DialogDescription>
              {"Are you sure you want to delete \""}
              {deleteTarget?.title}
              {"\"? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

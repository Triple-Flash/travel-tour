"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

const BUCKET = "tour-images"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function extractStoragePath(imageUrl: string) {
  try {
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    return pathMatch?.[1] ?? null
  } catch {
    return null
  }
}

export async function uploadDestinationImage(formData: FormData): Promise<{ url: string }> {
  await requireAdmin()

  const destinationId = formData.get("destinationId") as string
  const file = formData.get("file") as File

  if (!destinationId || !file) throw new Error("destinationId and file are required")
  if (!file.type.startsWith("image/")) throw new Error("Only image files are accepted")
  if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5 MB)")

  const destination = await db.destinations.findUnique({
    where: { id: destinationId },
    select: { image_url: true },
  })
  if (!destination) throw new Error("Destination not found")

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `destinations/${destinationId}/${Date.now()}.${ext}`
  const supabase = getServiceClient()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  const oldPath = destination.image_url ? extractStoragePath(destination.image_url) : null
  if (oldPath) {
    await supabase.storage.from(BUCKET).remove([oldPath])
  }

  await db.destinations.update({
    where: { id: destinationId },
    data: { image_url: publicUrl },
  })

  revalidatePath("/admin/destinations")
  revalidatePath("/", "layout")
  return { url: publicUrl }
}

export async function deleteDestinationImage(destinationId: string, imageUrl: string) {
  await requireAdmin()

  const storagePath = extractStoragePath(imageUrl)
  if (storagePath) {
    await getServiceClient().storage.from(BUCKET).remove([storagePath])
  }

  await db.destinations.update({
    where: { id: destinationId },
    data: { image_url: null },
  })

  revalidatePath("/admin/destinations")
  revalidatePath("/", "layout")
}

"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { createClient } from "@supabase/supabase-js"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

/** Service-role client — bypasses RLS, server-only, never exposed to browser */
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const BUCKET = "tour-images"

/** Upload a single image file to Supabase Storage and persist the URL to tour_images */
export async function uploadTourImage(formData: FormData): Promise<{ url: string; id: string }> {
  await requireAdmin()

  const tourId = formData.get("tourId") as string
  const file   = formData.get("file") as File

  if (!tourId || !file) throw new Error("tourId and file are required")
  if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5 MB)")

  const ext  = file.name.split(".").pop() ?? "jpg"
  const path = `tours/${tourId}/${Date.now()}.${ext}`

  const supabase = getServiceClient()
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  const record = await db.tour_images.create({
    data: { tour_id: tourId, image_url: publicUrl },
  })

  revalidatePath("/admin/tours")
  return { url: publicUrl, id: record.id }
}

/** Delete a tour image from Storage and from the DB */
export async function deleteTourImage(imageId: string, imageUrl: string) {
  await requireAdmin()

  // Extract the storage path from the public URL
  const url = new URL(imageUrl)
  // path is after /storage/v1/object/public/<bucket>/
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
  const storagePath = pathMatch?.[1]

  const supabase = getServiceClient()
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath])
  }

  await db.tour_images.delete({ where: { id: imageId } })
  revalidatePath("/admin/tours")
}

/** Fetch all images for a tour */
export async function getTourImages(tourId: string) {
  await requireAdmin()
  return db.tour_images.findMany({
    where: { tour_id: tourId },
    select: { id: true, image_url: true },
  })
}

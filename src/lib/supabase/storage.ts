import { createClient } from './client'

export async function uploadMenuImage(
  file: File,
  restaurantId: string
): Promise<{ path: string; url: string }> {
  const supabase = createClient()

  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${restaurantId}/${timestamp}.${extension}`

  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  // Get public URL (bucket is public, no signed URL needed)
  const { data: urlData } = supabase.storage
    .from('menu-images')
    .getPublicUrl(path)

  return { path: data.path, url: urlData.publicUrl }
}

export async function deleteMenuImage(path: string): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from('menu-images').remove([path])
}

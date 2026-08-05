import { createClient } from '@/supabase/server'

export async function uploadFileToStorage(
  bucket: 'resumes' | 'avatars' | 'contracts',
  path: string,
  file: Blob | Buffer,
  contentType?: string
): Promise<string> {
  const supabase = await createClient()

  try {
    // Attempt upload
    let { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType: contentType || 'application/octet-stream'
      })

    // Auto-create bucket if missing
    if (error && (error.message.includes('not found') || (error as any).statusCode === '404' || (error as any).status === 400)) {
      console.log(`Bucket "${bucket}" not found. Attempting auto-creation...`)
      await supabase.storage.createBucket(bucket, { public: true })

      // Retry upload
      const retry = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: contentType || 'application/octet-stream'
        })

      data = retry.data
      error = retry.error
    }

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      return publicUrlData.publicUrl
    }

    // Fallback: If bucket creation is blocked by Supabase storage permissions, return Data URI
    if (Buffer.isBuffer(file)) {
      const mime = contentType || 'application/pdf'
      return `data:${mime};base64,${file.toString('base64')}`
    }

    throw new Error(error?.message || 'Failed to upload file')
  } catch (err: any) {
    console.warn(`Storage upload warning for ${bucket}/${path}, using fallback:`, err?.message)
    if (Buffer.isBuffer(file)) {
      const mime = contentType || 'application/pdf'
      return `data:${mime};base64,${file.toString('base64')}`
    }
    throw err
  }
}

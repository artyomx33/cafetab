-- Allow public uploads to menu-images bucket (demo mode - no auth)

-- Policy for INSERT (upload)
CREATE POLICY "Allow public uploads to menu-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'menu-images');

-- Policy for SELECT (read/download)
CREATE POLICY "Allow public reads from menu-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Policy for DELETE (cleanup)
CREATE POLICY "Allow public deletes from menu-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'menu-images');

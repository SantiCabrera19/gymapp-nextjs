-- Eliminar políticas existentes que pueden estar causando conflictos
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Crear políticas corregidas para el bucket avatars
-- Política para permitir que los usuarios suban archivos
CREATE POLICY "Users can upload avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir que todos vean los avatars (son públicos)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir que los usuarios actualicen sus archivos
CREATE POLICY "Users can update avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir que los usuarios eliminen sus archivos
CREATE POLICY "Users can delete avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

-- Verificar que el bucket existe y es público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

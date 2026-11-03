-- Fulfillment module: Storage bucket and policies.
-- Object key: {workspace_id}/{request_id}/{attachment_id}/{filename}
-- The first path segment is the tenant boundary.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'request-files', 'request-files', false,
  104857600, -- 100 MB per object
  array[
    'image/png','image/jpeg','image/webp','image/gif','image/svg+xml','image/heic',
    'application/pdf',
    'application/zip','application/x-zip-compressed',
    'video/mp4','video/quicktime','video/webm',
    'audio/mpeg','audio/wav','audio/m4a',
    'text/plain','text/csv','text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/postscript','application/illustrator','image/vnd.adobe.photoshop',
    'application/octet-stream'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- helper: workspace id from an object key
create or replace function public.storage_workspace_id(object_name text)
returns uuid
language sql
immutable
as $$
  select case
    when split_part(object_name, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then split_part(object_name, '/', 1)::uuid
  end;
$$;

drop policy if exists "request-files read" on storage.objects;
create policy "request-files read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'request-files'
    and (public.is_staff() or public.is_workspace_member(public.storage_workspace_id(name)))
  );

drop policy if exists "request-files upload" on storage.objects;
create policy "request-files upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'request-files'
    and owner = auth.uid()
    and (public.is_staff() or public.is_workspace_member(public.storage_workspace_id(name)))
    -- key must have exactly four segments
    and array_length(string_to_array(name, '/'), 1) = 4
  );

drop policy if exists "request-files delete" on storage.objects;
create policy "request-files delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'request-files'
    and (public.is_staff() or owner = auth.uid())
  );
-- No update policy: objects are immutable; re-upload under a new attachment id.

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID ?? "placeholder"}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "placeholder",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "placeholder",
  },
});

const BUCKET = process.env.R2_BUCKET ?? "arkitech-portal";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

export async function presignUpload(key: string, contentType: string, expiresIn = 3600) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const url = await getSignedUrl(r2, cmd, { expiresIn });
  return { uploadUrl: url, key };
}

// Server-side upload — avoids browser→R2 CORS by streaming through our API.
export async function uploadObject(key: string, body: Buffer | Uint8Array, contentType: string) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return { key };
}

// Pull an object back down. Used when an approved demo zip has to be opened
// server-side so its contents can be committed to a new repo.
export async function getObject(key: string): Promise<Buffer> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const body = res.Body as { transformToByteArray?: () => Promise<Uint8Array> } | undefined;
  if (!body?.transformToByteArray) throw new Error(`R2 returned no body for ${key}`);
  return Buffer.from(await body.transformToByteArray());
}

export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function publicUrl(key: string) {
  return PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `/api/portal/files/${encodeURIComponent(key)}`;
}

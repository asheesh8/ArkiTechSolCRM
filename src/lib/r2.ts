import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function publicUrl(key: string) {
  return PUBLIC_URL ? `${PUBLIC_URL}/${key}` : `/api/portal/files/${encodeURIComponent(key)}`;
}

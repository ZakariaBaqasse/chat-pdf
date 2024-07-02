import { getS3Client } from "@/utils/s3-utils";
import fs from "fs";

export async function downloadFileFromS3(fileKey: string) {
  try {
    const s3 = getS3Client();
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    };
    const obj = await s3.getObject(params).promise();
    const fileName = `/tmp/pdf-${Date.now()}.pdf`;
    fs.writeFileSync(fileName, obj.Body as Buffer);
    return fileName;
  } catch (error) {
    console.error(error);
    return null;
  }
}

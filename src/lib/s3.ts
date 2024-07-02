import { getS3Client } from "@/utils/s3-utils";
import AWS from "aws-sdk";

export async function uploadFileToS3(file: File) {
  try {
    const s3 = getS3Client();

    const fileKey = `uploads/${Date.now().toString()}_${file.name.replaceAll(
      " ",
      "-"
    )}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (event) => {
        console.log(
          "upload progress: ",
          parseInt(((event.loaded * 100) / event.total).toString())
        );
      })
      .promise();

    await upload.then((data) => {
      console.log("file uploaded successfully: ", fileKey);
    });

    return Promise.resolve({
      fileKey,
      fileName: file.name,
    });
  } catch (error) {
    console.error("error in uploadFileToS3", error);
  }
}

export function getS3FileURL(fileKey: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${fileKey}`;
  return url;
}

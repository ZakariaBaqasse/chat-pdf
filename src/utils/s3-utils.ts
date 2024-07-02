import AWS from "aws-sdk";

export function getS3Client() {
  AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  });

  return new AWS.S3({
    params: {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    },
    region: "eu-north-1",
  });
}

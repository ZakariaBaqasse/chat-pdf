import { downloadFileFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { error } from "console";
import { saveToVectorStore } from "./embeddings";

export async function loadS3FileToPinecone(fileKey: string) {
  try {
    //1. obtain the pdf
    console.log("downloading file from s3...");
    const fileName = await downloadFileFromS3(fileKey);
    if (!fileName) {
      throw new Error(
        `loadS3FileToPinecone: failed to download file from S3 ${error}`
      );
    }
    const loader = new PDFLoader(fileName, { splitPages: false });
    const pages = await loader.load();
    console.log(pages[0]);
    //2. split document
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1024,
      chunkOverlap: 128,
    });

    const documents = await splitter.splitDocuments(pages);
    //3. vectorize and load to pinecone documents
    await saveToVectorStore(documents, fileKey);
  } catch (error) {
    console.error(error);
  }
}

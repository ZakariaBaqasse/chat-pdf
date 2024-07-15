import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StreamingTextResponse, Message, LangChainAdapter } from "ai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { formatDocumentsAsString } from "langchain/util/document";

export const runtime = "edge";

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
  streaming: true,
});

const formatMessage = (message: Message) => {
  return [message.role, message.content];
};

const qaSystemPrompt = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

{context}`;

const contextualizeQSystemPrompt = `Given a chat history and the latest user question
which might reference context in the chat history, formulate a standalone question
which can be understood without the chat history. Do NOT answer the question,
just reformulate it if needed and otherwise return it as is.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages ?? [];
    const chat = await db.select().from(chats).where(eq(chats.id, body.chatId));
    if (!chat || chat.length !== 1) {
      return Response.json(
        {
          message: "Chat not found",
          success: false,
        },
        {
          status: 404,
        }
      );
    }
    const formattedMessages = messages.slice(-20).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", contextualizeQSystemPrompt],
      ["placeholder", "{chat_history}"],
      ["user", "{question}"],
    ]);
    const contextualizeQChain = RunnableSequence.from([
      contextualizeQPrompt,
      llm,
      new StringOutputParser(),
    ]);

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace: chat[0].fileKey }
    );
    const retriever = vectorStore.asRetriever();
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", qaSystemPrompt],
      ["placeholder", "{chat_history}"],
      ["user", "{question}"],
    ]);
    const qaChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: (input: Record<string, unknown>) => {
          if ("chat_history" in input) {
            return contextualizeQChain
              .pipe(retriever)
              .pipe(formatDocumentsAsString);
          }
          return "";
        },
      }),
      qaPrompt,
      llm,
    ]);

    const stream = await qaChain.stream({
      chat_history: formattedMessages.join("\n"),
      question: currentMessageContent,
    });
    const aiStream = LangChainAdapter.toAIStream(stream, {
      onStart: async () => {
        await db
          .insert(_messages)
          .values({
            chatId: body.chatId,
            content: currentMessageContent,
            role: "user",
          });
      },
      onCompletion: async (completion) => {
        await db
          .insert(_messages)
          .values({ chatId: body.chatId, content: completion, role: "ai" });
      },
    });
    return new StreamingTextResponse(aiStream);
  } catch (error) {
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

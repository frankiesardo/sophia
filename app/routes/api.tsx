import type { Route } from "./+types/chat";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import path from "path";
import fs from "fs/promises";
import pdf from "pdf-parse";
import EPub from "epub";

const openai = createOpenAICompatible({
  baseURL: process.env.OPENAI_API_BASE_URL,
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
});

async function parsePdf(filePath: string) {
  const data = await pdf(await fs.readFile(filePath));
  return data.text;
}

async function parseEpub(filePath: string) {
  const epub = new EPub(filePath);
  await new Promise((resolve, reject) => {
    epub.on("end", resolve);
    epub.parse();
  });

  let text = "";
  for (const chapter of epub.flow) {
    text += await new Promise((resolve, reject) => {
      epub.getChapter(chapter.id, (err, chapterText) => {
        if (err) {
          reject(err);
        } else {
          resolve(chapterText);
        }
      });
    });
  }
  return text;
}

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { messages } = await request.json();
  const { bookId } = params;
  const isPdf = bookId.endsWith(".pdf");
  const isEpub = bookId.endsWith(".epub");

  if (!isPdf && !isEpub) {
    throw new Error(
      "Unsupported file format. Only PDF and EPUB files are supported."
    );
  }
  const filePath = path.join(process.cwd(), "app", "assets", bookId);
  const text = isPdf ? await parsePdf(filePath) : await parseEpub(filePath);

  const systemMessage = {
    role: "system",
    content: `
Answer all questions related to this book:

--- BEGIN BOOK ---
${text}
--- END BOOK ---
    `,
  };

  const result = streamText({
    model: openai("google:gemini-1.5-pro-001"),
    messages: [systemMessage, ...messages],
  });

  return result.toDataStreamResponse();
};

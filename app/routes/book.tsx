import { JSDOM } from "jsdom";
import fs from "fs/promises";
import path from "path";
import type { Route } from "./+types/book";
import { redirect } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { "*": splat } = params;
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const extension = searchParams.get("extension");

  const id = splat!.split("/")[0];
  const fileName = id + "." + extension;
  const filePath = path.join(process.cwd(), "app", "assets", fileName);

  try {
    await fs.access(filePath);
    return redirect("/chat/" + fileName);
  } catch {
    // Directory doesn't exist or other error, continue with download
  }

  const response = await fetch(`https://z-lib.gs/book/${splat}`);
  const body = await response.text();
  await fs.writeFile("debug.html", body);

  const dom = new JSDOM(body);
  const downloadLink = dom.window.document.querySelector(".addDownloadedBook");
  const downloadUrl = downloadLink?.getAttribute("href");

  const pdfResponse = await fetch("https://z-lib.gs" + downloadUrl);
  const pdfBuffer = await pdfResponse.arrayBuffer();

  await fs.writeFile(filePath, Buffer.from(pdfBuffer));
  return redirect(`/chat/${fileName}`);
}

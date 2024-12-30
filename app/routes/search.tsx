import { Card, CardContent } from "~/components/ui/card";
import { JSDOM } from "jsdom";
import { useLoaderData } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import type { Route } from "./+types/search";

function parseBooks(html: string) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const bookCards = document.getElementsByTagName("z-bookcard");

  return Array.from(bookCards).map((card) => ({
    id: card.getAttribute("id"),
    isbn: card.getAttribute("isbn"),
    href: card.getAttribute("href"),
    publisher: card.getAttribute("publisher"),
    language: card.getAttribute("language"),
    year: card.getAttribute("year"),
    extension: card.getAttribute("extension"),
    filesize: card.getAttribute("filesize"),
    rating: card.getAttribute("rating"),
    quality: card.getAttribute("quality"),
    img: card.querySelector("img")?.getAttribute("data-src"),
    title: card.querySelector('div[slot="title"]')?.textContent,
    author: card.querySelector('div[slot="author"]')?.textContent,
    note: card.querySelector('div[slot="note"]')?.textContent,
  }));
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  const response = await fetch(
    `https://z-lib.gs/s/${encodeURIComponent(
      query
    )}?extensions%5B0%5D=PDF&extensions%5B1%5D=EPUB`
  );

  const body = await response.text();
  const books = parseBooks(body);
  return books;
}

export default function Search() {
  const books = useLoaderData<typeof loader>();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md md:max-w-4xl">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          <div className="space-y-4">
            {books.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No books found</p>
                </CardContent>
              </Card>
            ) : (
              books.map((book) => (
                <Link
                  key={book.id}
                  to={book.href + "?extension=" + book.extension}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-start space-x-4">
                      {book.img && (
                        <img
                          src={
                            book.img === "/img/cover-not-exists.png"
                              ? "https://z-lib.gs/img/cover-not-exists.png"
                              : book.img
                          }
                          alt={book.title || "Book cover"}
                          width={80}
                          height={120}
                          className="object-cover rounded-sm"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold">{book.title}</h3>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          <p className="text-sm text-gray-500">
                            {book.publisher} • {book.year}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {book.language && (
                            <Badge variant="secondary">{book.language}</Badge>
                          )}
                          {book.filesize && (
                            <Badge variant="outline">{book.filesize}</Badge>
                          )}
                          {book.extension && (
                            <Badge variant="outline">{book.extension}</Badge>
                          )}
                        </div>

                        {book.note && (
                          <p className="text-sm text-muted-foreground">
                            {book.note}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

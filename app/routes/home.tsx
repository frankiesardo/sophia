import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md md:max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-center">Book Search</h1>
          <form className="space-y-2" action="/search">
            <Input
              type="text"
              name="q"
              placeholder="Which book do you want to consult?"
            />
            <Button type="submit" className="w-full">
              Search
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "./routes/search.tsx"),
  route("book/*", "./routes/book.tsx"),
  route("chat/:bookId", "./routes/chat.tsx"),
  route("api/:bookId", "./routes/api.tsx"),
] satisfies RouteConfig;

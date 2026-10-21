import { redirect } from "next/navigation";

// The site itself is pure HTML/CSS/JS served from /public.
// This route only exists as a fallback if the rewrite in
// next.config.ts is ever bypassed: it forwards "/" to /index.html.
export default function Home() {
  redirect("/index.html");
}

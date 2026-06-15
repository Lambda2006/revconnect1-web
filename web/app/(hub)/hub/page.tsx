import { redirect } from "next/navigation";

// /hub → redirect to the topic queue (primary hub entry point)
export default function HubPage() {
  redirect("/hub/blog/queue");
}

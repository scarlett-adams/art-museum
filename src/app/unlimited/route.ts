import { connection } from "next/server";
import { newRoundId } from "@/lib/harvard";

// Starts an unlimited round by redirecting to a random artwork's page. That
// page's URL is what players share to challenge a friend.
export async function GET() {
  await connection();
  // The round page shows a "couldn't load" message for ids it doesn't know.
  let path = "/unlimited/unavailable";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      path = `/unlimited/${await newRoundId()}`;
      break;
    } catch (error) {
      console.error(error);
    }
  }
  // A relative Location keeps the visitor on whatever domain they used.
  return new Response(null, {
    status: 307,
    headers: { Location: path, "Cache-Control": "no-store" },
  });
}

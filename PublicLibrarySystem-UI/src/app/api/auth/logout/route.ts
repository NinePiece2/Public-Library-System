import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  return new Response(
    JSON.stringify({ message: "Logged out successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

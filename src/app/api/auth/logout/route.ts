import { successResponse } from "@/lib/response";

export async function POST() {
  const response = successResponse(null, "Logout berhasil");

  // Delete cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}

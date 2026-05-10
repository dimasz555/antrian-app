import { NextResponse } from "next/server";

type ApiResponseBody<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export function successResponse<T>(
  data: T,
  message = "Berhasil",
  status = 200,
): NextResponse {
  const body: ApiResponseBody<T> = {
    success: true,
    message,
    data,
  };
  return NextResponse.json(body, { status });
}

// Response error
export function errorResponse(
  message = "Terjadi kesalahan",
  status = 500,
  error?: string,
): NextResponse {
  const body: ApiResponseBody<never> = {
    success: false,
    message,
    error,
  };
  return NextResponse.json(body, { status });
}

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
) {
  const body: ApiResponseBody<T> = {
    success: true,
    message,
    data,
  };
  return Response.json(body, { status });
}

// Response error — status default 500
export function errorResponse(
  message = "Terjadi kesalahan",
  status = 500,
  error?: string,
) {
  const body: ApiResponseBody<never> = {
    success: false,
    message,
    error,
  };
  return Response.json(body, { status });
}

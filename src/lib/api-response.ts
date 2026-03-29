import { NextResponse } from "next/server";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data, timestamp: new Date().toISOString() } satisfies ApiResponse<T>,
    { status }
  );
}

export function apiError(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error, timestamp: new Date().toISOString() } satisfies ApiResponse,
    { status }
  );
}

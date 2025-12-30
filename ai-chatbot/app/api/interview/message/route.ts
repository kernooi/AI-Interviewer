import { NextResponse } from "next/server";
import { interviewService } from "@/server/services/interview.service";

export async function POST(req: Request) {
  const { message } = await req.json();

  const reply = await interviewService.handleMessage(message);

  return NextResponse.json({ reply });
}

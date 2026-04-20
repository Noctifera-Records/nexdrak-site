import { auth } from "@/lib/auth";

const handler = async (req: Request) => {
  return await auth.handler(req);
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;

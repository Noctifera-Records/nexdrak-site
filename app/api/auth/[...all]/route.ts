import { auth } from "@/lib/auth";

export const GET = async (req: Request) => {
  return await auth.handler(req);
};

export const POST = async (req: Request) => {
  return await auth.handler(req);
};

export const PATCH = async (req: Request) => {
  return await auth.handler(req);
};

export const PUT = async (req: Request) => {
  return await auth.handler(req);
};

export const DELETE = async (req: Request) => {
  return await auth.handler(req);
};

export const OPTIONS = async (req: Request) => {
  return await auth.handler(req);
};

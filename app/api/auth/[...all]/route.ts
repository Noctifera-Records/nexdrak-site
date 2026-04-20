import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  return await auth.handler(req);
}

export async function POST(req: Request) {
  return await auth.handler(req);
}

export async function PATCH(req: Request) {
  return await auth.handler(req);
}

export async function PUT(req: Request) {
  return await auth.handler(req);
}

export async function DELETE(req: Request) {
  return await auth.handler(req);
}

export async function OPTIONS(req: Request) {
  return await auth.handler(req);
}

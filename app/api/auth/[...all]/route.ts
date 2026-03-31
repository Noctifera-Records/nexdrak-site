import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  return auth.handler(req);
}

export async function POST(req: Request) {
  return auth.handler(req);
}

export async function PATCH(req: Request) {
  return auth.handler(req);
}

export async function PUT(req: Request) {
  return auth.handler(req);
}

export async function DELETE(req: Request) {
  return auth.handler(req);
}

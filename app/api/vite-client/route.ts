import type { NextRequest } from "next/server"

export function GET(_req: NextRequest) {
  return new Response("// noop vite client stub", {
    status: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

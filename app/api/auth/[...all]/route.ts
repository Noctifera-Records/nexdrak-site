import { getAuth } from "@/lib/auth";
import { createRequestContextDb } from "@/lib/db";

const handler = async (req: Request) => {
  // 1. Creamos la conexión fresca para ESTA petición
  const { db, client } = await createRequestContextDb();
  
  try {
    // 2. Inicializamos auth con ESA conexión
    const authInstance = getAuth(db);
    
    // 3. Procesamos la petición
    return await authInstance.handler(req);
  } finally {
    // 4. CERRAMOS la conexión inmediatamente
    // Esto es vital para evitar el error de "I/O context"
    await client.end();
  }
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = handler;

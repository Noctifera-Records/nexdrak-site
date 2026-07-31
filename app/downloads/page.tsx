import { redirect } from 'next/navigation'
import { getAuth } from "@/lib/auth"
import { getRequestContextDb } from "@/lib/db"
import { headers } from "next/headers"
import DownloadsGrid from './downloads-grid'
import { getDownloads } from './actions'

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  // Obtenemos la conexión compartida para TODA la petición
  const { db, client } = await getRequestContextDb();

  let session;
  try {
    const auth = getAuth(db);
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (e) {
    console.error("DownloadsPage Session Error:", e);
    await client.end();
    return <div>Something went wrong. Please try again.</div>;
  }

  // redirect() lanza un error interno NEXT_REDIRECT que NO debe atraparse
  if (!session) {
    await client.end();
    redirect('/login');
  }

  try {
    // getDownloads reutiliza la misma conexión 'db' dentro de esta petición
    const downloads = await getDownloads();

    if (!downloads) {
      return (
        <div className="container mx-auto px-4 py-24 mt-10 text-foreground text-center">
          <h1 className="text-4xl font-bold mb-6">DOWNLOADS</h1>
          <p className="text-destructive">Error loading downloads or unauthorized</p>
        </div>
      );
    }

    const formattedDownloads = (downloads as any[]).map((d: any) => ({
      ...d,
      created_at: d.created_at ? (typeof d.created_at === 'string' ? d.created_at : new Date(d.created_at).toISOString()) : null,
    }));

    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">EXCLUSIVE DOWNLOADS</h1>
            <p className="text-muted-foreground">Exclusive content for registered members</p>
          </div>
          <DownloadsGrid downloads={formattedDownloads} />
        </div>
      </div>
    );
  } catch (e) {
    console.error("DownloadsPage Error:", e);
    return <div>Something went wrong. Please try again.</div>;
  } finally {
    // Cerramos la conexión única al final de todo
    await client.end();
  }
}

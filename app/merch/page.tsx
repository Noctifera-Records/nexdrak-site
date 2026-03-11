import { getPublicMerch } from "./actions";
import MerchClient from "./merch-client";

export const metadata = {
  title: "Merch",
  description: "Official NexDrak merchandise. Limited editions and exclusive designs.",
};

export default async function MerchPage() {
  const merchData = await getPublicMerch();
  
  // Serialize dates for client component
  const formattedMerch = merchData.map((item: any) => ({
    ...item,
    created_at: item.created_at.toISOString(),
    // Ensure price is a number if it comes as string from DB (numeric type)
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
  }));

  return <MerchClient initialMerch={formattedMerch} />;
}

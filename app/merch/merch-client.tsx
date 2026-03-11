"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MerchItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  purchase_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

interface MerchClientProps {
  initialMerch: MerchItem[];
}

export default function MerchClient({ initialMerch }: MerchClientProps) {
  const [merchItems] = useState<MerchItem[]>(initialMerch);
  const [filteredItems, setFilteredItems] = useState<MerchItem[]>(initialMerch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    filterAndSortItems();
  }, [merchItems, selectedCategory, sortBy]);

  const filterAndSortItems = () => {
    let filtered = [...merchItems];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // Keep original order for featured
        break;
    }

    setFilteredItems(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(merchItems.map(item => item.category))];
    return categories;
  };

  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: (filteredItems.length > 0 ? filteredItems : merchItems).map((item, i) => ({
              "@type": "Product",
              position: i + 1,
              name: item.name,
              image: item.image_url || undefined,
              description: item.description || undefined,
              category: item.category,
              offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: item.price,
                availability: item.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                url: item.purchase_url
              }
            }))
          })
        }}
      />
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground dark:text-white">OFFICIAL MERCH</h1>
        <p className="text-muted-foreground dark:text-gray-300">Official NexDrak merchandise. Limited editions and exclusive designs.</p>
      </div>

      {merchItems.length > 0 && (
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <span className="text-sm text-muted-foreground dark:text-gray-400">Filter by:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-background/80 dark:bg-black/50 border-input dark:border-white/20 text-foreground dark:text-white backdrop-blur-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground dark:text-gray-400">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-background/80 dark:bg-black/50 border-input dark:border-white/20 text-foreground dark:text-white backdrop-blur-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-card/50 dark:bg-black/50 backdrop-blur-sm border-border dark:border-white/20 overflow-hidden group hover:border-foreground/40 dark:hover:border-white/40 transition-all shadow-sm dark:shadow-none">
              <div className="aspect-square relative bg-muted dark:bg-black/30">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground dark:text-gray-600" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-gray-200 transition-colors">{item.name}</h3>
                {item.description && (
                  <p className="text-muted-foreground dark:text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-foreground dark:text-white font-bold mt-2">${item.price}</p>
                <span className="inline-block bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-300 text-xs px-2 py-1 rounded mt-2 border border-border dark:border-gray-700">
                  {item.category}
                </span>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:hover:bg-gray-200 dark:text-black transition-colors"
                  asChild
                >
                  <a 
                    href={item.purchase_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Purchase Now
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground dark:text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground dark:text-gray-400 text-lg">
            {merchItems.length === 0 ? 'No hay productos disponibles' : 'No se encontraron productos en esta categoría'}
          </p>
          <p className="text-muted-foreground/80 dark:text-gray-500 text-sm">Los productos aparecerán aquí cuando se agreguen</p>
        </div>
      )}
    </div>
  );
}

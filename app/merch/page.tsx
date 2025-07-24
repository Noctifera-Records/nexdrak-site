'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

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

export default function MerchPage() {
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const supabase = createClient();

  useEffect(() => {
    fetchMerch();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [merchItems, selectedCategory, sortBy]);

  const fetchMerch = async () => {
    try {
      const { data, error } = await supabase
        .from('merch')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching merch:', error);
        return;
      }

      setMerchItems(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = merchItems;

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 mt-10">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">OFFICIAL MERCH</h1>
          <p className="text-gray-300">Cargando productos...</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-black/50 backdrop-blur-sm border-white/20">
              <div className="aspect-square bg-gray-800 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 mt-10">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">OFFICIAL MERCH</h1>
        <p className="text-gray-300">Official NexDrak merchandise. Limited editions and exclusive designs.</p>
      </div>

      {merchItems.length > 0 && (
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter by:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-black/50 border-white/20">
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
            <span className="text-sm text-gray-400">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-black/50 border-white/20">
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
            <Card key={item.id} className="bg-black/50 backdrop-blur-sm border-white/20 overflow-hidden group hover:border-white/40 transition-all">
              <div className="aspect-square relative bg-black/30">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-16 w-16 text-gray-600" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                <p className="text-white font-bold mt-2">${item.price}</p>
                <span className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded mt-2">
                  {item.category}
                </span>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full bg-white hover:bg-gray-200 text-black"
                  asChild
                >
                  <a 
                    href={item.purchase_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Comprar Ahora
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {merchItems.length === 0 ? 'No hay productos disponibles' : 'No se encontraron productos en esta categoría'}
          </p>
          <p className="text-gray-500 text-sm">Los productos aparecerán aquí cuando se agreguen</p>
        </div>
      )}

      {/* <div className="max-w-2xl mx-auto mt-16 p-8 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">CUSTOM ORDERS</h2>
        <p className="text-gray-300 mb-6">
          Looking for custom merchandise for your event or group? Contact us for bulk orders and custom designs.
        </p>
        <Button className="bg-white hover:bg-gray-200 text-black">CONTACT FOR CUSTOM ORDERS</Button>
      </div> */}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MerchTable } from './merch-table';
import { MerchForm } from './merch-form';
import { getMerch, deleteMerch } from './actions';
import { toast } from 'sonner';

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
  updated_at: string;
}

export default function AdminMerchPage() {
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    try {
      const data = await getMerch();
      setMerchItems(data);
    } catch (error) {
      console.error('Error fetching merch:', error);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MerchItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteMerch(id);
      setMerchItems(prev => prev.filter(item => item.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchMerch(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Merchandise</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Merchandise</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <MerchTable 
        items={merchItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <MerchForm
          item={editingItem}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

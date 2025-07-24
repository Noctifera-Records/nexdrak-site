'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { MerchTable } from './merch-table';
import { MerchForm } from './merch-form';

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
  const supabase = createClient();

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    try {
      const { data, error } = await supabase
        .from('merch')
        .select('*')
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

  const handleEdit = (item: MerchItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('merch')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting merch:', error);
        alert('Error al eliminar el producto');
        return;
      }

      setMerchItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
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
          <p>Cargando productos...</p>
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
          Agregar Producto
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
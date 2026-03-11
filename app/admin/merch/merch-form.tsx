'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminImageUpload } from '@/components/image-upload';
import { createMerch, updateMerch } from './actions';
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

interface MerchFormProps {
  item?: MerchItem | null;
  onClose: () => void;
}

const categories = [
  'clothing',
  'accessories', 
  'vinyl',
  'digital',
  'collectibles',
  'other'
];

export function MerchForm({ item, onClose }: MerchFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    purchase_url: '',
    category: 'other',
    is_available: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        image_url: item.image_url || '',
        purchase_url: item.purchase_url,
        category: item.category,
        is_available: item.is_available
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price');
        setLoading(false);
        return;
      }

      const merchData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: price,
        image_url: formData.image_url.trim() || null,
        purchase_url: formData.purchase_url.trim(),
        category: formData.category,
        is_available: formData.is_available
      };

      if (item) {
        // Update existing item
        await updateMerch(item.id, merchData);
        toast.success('Product updated');
      } else {
        // Create new item
        await createMerch(merchData);
        toast.success('Product created');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving merch:', error);
      toast.error(error.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {item ? 'Edit Product' : 'Add Product'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. NexDrak T-Shirt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Product details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="29.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_url">Purchase URL *</Label>
              <Input
                id="purchase_url"
                type="url"
                value={formData.purchase_url}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_url: e.target.value }))}
                placeholder="https://shop.example.com/product"
                required
              />
              <p className="text-sm text-gray-500">
                Link where users can buy this product (e.g. Shopify, Etsy, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
              <Label>Product Image</Label>
              <AdminImageUpload
                onImageUpload={handleImageUpload}
                currentImage={formData.image_url}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
              <Label htmlFor="is_available">Product Available</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

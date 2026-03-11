'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DownloadsTable from './downloads-table';
import { getDownloads } from './actions';
import { toast } from 'sonner';

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const data = await getDownloads();
      setDownloads(data);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDownloads();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Downloads</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Downloads Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Exclusive content for registered users
          </p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {downloads.length} items
        </div>
      </div>
      
      <DownloadsTable downloads={downloads} onRefresh={handleRefresh} />
    </div>
  );
}

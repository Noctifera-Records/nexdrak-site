'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReleasesTable from './releases-table';
import { getReleases } from './actions';
import { toast } from 'sonner';

export default function ReleasesPage() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const data = await getReleases();
      // Ensure dates are strings for the frontend
      const formattedData = data.map((release: any) => ({
          ...release,
          release_date: new Date(release.release_date).toISOString().split('T')[0]
      }));
      setReleases(formattedData);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReleases();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Releases</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading releases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Releases Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your discography releases
          </p>
        </div>
        <div className="text-sm text-gray-400">
          Total: {releases.length} releases
        </div>
      </div>
      
      <ReleasesTable releases={releases} onRefresh={handleRefresh} />
    </div>
  );
}

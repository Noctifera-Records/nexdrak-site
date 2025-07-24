'use client';

import { useState, useEffect } from 'react';
import { Users, Music, ShoppingBag, Download, Calendar, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  users: number;
  songs: number;
  merch: number;
  downloads: number;
  events: number;
  releases: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    songs: 0,
    merch: 0,
    downloads: 0,
    events: 0,
    releases: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        usersResult,
        songsResult,
        merchResult,
        downloadsResult,
        eventsResult,
        releasesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('songs').select('id', { count: 'exact', head: true }),
        supabase.from('merch').select('id', { count: 'exact', head: true }),
        supabase.from('downloads').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('releases').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersResult.count || 0,
        songs: songsResult.count || 0,
        merch: merchResult.count || 0,
        downloads: downloadsResult.count || 0,
        events: eventsResult.count || 0,
        releases: releasesResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Users',
      value: stats.users,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Songs',
      value: stats.songs,
      icon: Music,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Merchandise',
      value: stats.merch,
      icon: ShoppingBag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Downloads',
      value: stats.downloads,
      icon: Download,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Events',
      value: stats.events,
      icon: Calendar,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Releases',
      value: stats.releases,
      icon: Package,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to the admin panel</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your content and users</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="/admin/music" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
              >
                <Music className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-white">Add Music</p>
              </a>
              <a 
                href="/admin/merch" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
              >
                <ShoppingBag className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-white">Add Merch</p>
              </a>
              <a 
                href="/admin/events" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
              >
                <Calendar className="h-5 w-5 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-white">Add Event</p>
              </a>
              <a 
                href="/admin/downloads" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
              >
                <Download className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-white">Add Download</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-green-500 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Authentication</span>
              <span className="text-green-500 text-sm">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">File Storage</span>
              <span className="text-green-500 text-sm">Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-gray-500 text-sm">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

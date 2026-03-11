'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSiteSettings, updateSiteSettings } from './actions';
import { AdminImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';

interface Setting {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      
      // Define all required keys to ensure they appear even if missing in DB
      const requiredKeys = [
        'site_title',
        'site_description',
        'contact_email',
        'booking_email',
        'hero_release_text',
        'hero_album_link',
        'hero_background_image',
        'hero_release_image',
        'site_logo',
        'site_logo_mobile',
        'navbar_logo'
      ];

      // Merge DB data with required keys
      const mergedSettings = requiredKeys.map((key, index) => {
        const existing = data.find((item: any) => item.key === key);
        return {
          id: index + 1,
          key: key,
          value: existing?.value || '',
          description: getSettingDescription(key),
          type: getSettingType(key),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      
      setSettings(mergedSettings);
      
      // Inicializar formData con los valores actuales
      const initialData: Record<string, string> = {};
      mergedSettings.forEach(setting => {
        initialData[setting.key] = setting.value || '';
      });
      setFormData(initialData);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get setting metadata
  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      'hero_album_link': 'Main album link on the home page',
      'hero_background_image': 'Background image for the hero section',
      'hero_release_image': 'Small image that appears next to the release text',
      'hero_release_text': 'Text that appears in the hero section next to the image',
      'site_logo': 'Main site logo',
      'site_logo_mobile': 'Mobile site logo',
      'navbar_logo': 'Logo that appears in the navigation bar',
      'site_title': 'Site title',
      'site_description': 'Site description',
      'contact_email': 'Contact email',
      'booking_email': 'Booking email'
    };
    return descriptions[key] || key;
  };

  const getSettingType = (key: string): string => {
    const types: Record<string, string> = {
      'hero_album_link': 'url',
      'hero_background_image': 'image',
      'hero_release_image': 'image',
      'site_logo': 'image',
      'site_logo_mobile': 'image',
      'navbar_logo': 'image',
      'contact_email': 'email',
      'booking_email': 'email',
      'site_description': 'textarea'
    };
    return types[key] || 'text';
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleImageUpload = (key: string, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: imageUrl
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await updateSiteSettings(formData);
      toast.success('Configuraciones guardadas exitosamente');
      fetchSettings(); // Refrescar los datos
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const value = formData[setting.key] || '';

    switch (setting.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <Label>{setting.description}</Label>
            <AdminImageUpload
              onImageUpload={(imageUrl) => handleImageUpload(setting.key, imageUrl)}
              currentImage={value}
            />
            <Input
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder="O ingresa URL de imagen"
              className="mt-2"
            />
          </div>
        );
      
      case 'url':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.description}</Label>
            <Input
              id={setting.key}
              type="url"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder="https://..."
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.description}</Label>
            <Textarea
              id={setting.key}
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              rows={3}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.description}</Label>
            <Input
              id={setting.key}
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              placeholder={setting.description || ''}
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Site Settings</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading site settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Home Page - Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter(setting => ['hero_album_link', 'hero_background_image', 'hero_release_image', 'hero_release_text'].includes(setting.key))
              .map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logos and Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter(setting => ['site_logo', 'site_logo_mobile', 'navbar_logo'].includes(setting.key))
              .map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter(setting => ['site_title', 'site_description', 'contact_email', 'booking_email'].includes(setting.key))
              .map(setting => (
                <div key={setting.key}>
                  {renderSettingInput(setting)}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Changes will be applied immediately after saving.</p>
            <p>• For images, you can upload files or use external URLs.</p>
            <p>• <strong>Main Logo:</strong> Used on the home page (desktop and mobile).</p>
            <p>• <strong>Navbar Logo:</strong> Used in the top navigation bar.</p>
            <p>• <strong>Hero release image:</strong> Small image that appears next to the release text on the home page.</p>
            <p>• <strong>Hero release text:</strong> Text that appears next to the release image (e.g., "NEW RELEASE", "NUEVO SINGLE").</p>
            <p>• <strong>Hero background image:</strong> Background image for the hero section on the home page.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

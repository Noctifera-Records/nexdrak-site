'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { AdminImageUpload } from '@/components/image-upload';

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
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      setSettings(data || []);
      
      // Inicializar formData con los valores actuales
      const initialData: Record<string, string> = {};
      data?.forEach(setting => {
        initialData[setting.key] = setting.value || '';
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
      // Actualizar cada setting
      const updates = Object.entries(formData).map(([key, value]) => 
        supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key)
      );

      const results = await Promise.all(updates);
      
      // Verificar si hubo errores
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors updating settings:', errors);
        alert('Error al guardar algunas configuraciones');
        return;
      }

      alert('Configuraciones guardadas exitosamente');
      fetchSettings(); // Refrescar los datos
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar las configuraciones');
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
          <h1 className="text-2xl font-bold">Configuraciones del Sitio</h1>
        </div>
        <div className="text-center py-8">
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuraciones del Sitio</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSettings}
            disabled={saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refrescar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Configuraciones de la página principal */}
        <Card>
          <CardHeader>
            <CardTitle>Página Principal - Sección Hero</CardTitle>
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

        {/* Configuraciones del logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logos y Branding</CardTitle>
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

        {/* Configuraciones generales */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
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

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Los cambios se aplicarán inmediatamente después de guardar.</p>
            <p>• Para las imágenes, puedes subir archivos o usar URLs externas.</p>
            <p>• <strong>Logo principal:</strong> Se usa en la página de inicio (desktop y móvil).</p>
            <p>• <strong>Logo navbar:</strong> Se usa en la barra de navegación superior.</p>
            <p>• <strong>Imagen de lanzamiento:</strong> Imagen pequeña que aparece junto al texto en la página principal.</p>
            <p>• <strong>Texto de lanzamiento:</strong> Texto que aparece junto a la imagen (ej: "NEW RELEASE", "NUEVO SINGLE").</p>
            <p>• <strong>Imagen de fondo:</strong> Fondo de la sección principal de la página de inicio.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
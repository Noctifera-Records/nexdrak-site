'use client';

import { AlertTriangle, Shield, User, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RLSErrorHelpProps {
  error?: string;
  operation?: string;
}

export function RLSErrorHelp({ error, operation }: RLSErrorHelpProps) {
  const isRLSError = error?.includes('row-level security policy') || error?.includes('permisos');

  if (!isRLSError) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Shield className="h-5 w-5" />
          Problema de Permisos de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La operación falló debido a políticas de seguridad a nivel de fila (RLS) en la base de datos.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Verifica tu autenticación</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Asegúrate de estar correctamente autenticado en la aplicación.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Solución para administradores</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Ve al SQL Editor de Supabase y ejecuta uno de estos scripts:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">sql/fix-songs-rls-simple.sql</code> (recomendado)</li>
                <li>• <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">sql/disable-rls-temporarily.sql</code> (testing rápido)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Error técnico:</strong> {error}
          </p>
          {operation && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <strong>Operación:</strong> {operation}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
# 🔐 Guía de Permisos de Administrador - Supabase

## 🚨 Problema: Error 403 al Eliminar Usuarios

El error `DELETE 403 (Forbidden)` al intentar eliminar usuarios ocurre porque tu cuenta no tiene permisos de **Service Role** en Supabase para operaciones de `auth.admin`.

## ✅ Soluciones Implementadas

### **1. Solución Parcial (Ya Implementada)**
El sistema ahora maneja el error 403 de manera inteligente:
- ✅ **Elimina el usuario del panel de administración** (tabla `profiles`)
- ✅ **Desactiva el acceso del usuario** al sistema
- ⚠️ **No elimina completamente** el usuario de `auth.users` (requiere permisos especiales)

### **2. Mensaje Informativo**
Cuando ocurre el error 403, el sistema muestra:
> "Usuario desactivado del panel de administración. Para eliminarlo completamente del sistema de autenticación, necesitas configurar los permisos de Service Role en Supabase."

## 🔧 Solución Completa (Configuración en Supabase)

Para eliminar usuarios completamente, necesitas configurar los permisos correctos:

### **Opción A: Usar Service Role Key (Recomendado para Desarrollo)**

1. **Ve a tu Dashboard de Supabase**
2. **Settings > API**
3. **Copia la "service_role" key** (no la "anon" key)
4. **Crea una variable de entorno**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

5. **Crea un cliente con Service Role** para operaciones de admin:
   ```typescript
   // lib/supabase/admin-client.ts
   import { createClient } from '@supabase/supabase-js'
   
   export const supabaseAdmin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
     {
       auth: {
         autoRefreshToken: false,
         persistSession: false
       }
     }
   )
   ```

### **Opción B: Configurar RLS Policies (Recomendado para Producción)**

1. **Ve a SQL Editor en Supabase**
2. **Ejecuta este SQL**:
   ```sql
   -- Crear función para eliminar usuarios (solo admins)
   CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
   RETURNS BOOLEAN
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     -- Verificar que el usuario actual es admin
     IF NOT EXISTS (
       SELECT 1 FROM profiles 
       WHERE id = auth.uid() AND role = 'admin'
     ) THEN
       RAISE EXCEPTION 'No tienes permisos de administrador';
     END IF;
     
     -- Eliminar de profiles
     DELETE FROM profiles WHERE id = user_id;
     
     -- Eliminar de auth.users (requiere service role)
     -- Esta parte necesita ser manejada desde el backend
     
     RETURN TRUE;
   END;
   $$;
   ```

### **Opción C: API Route con Service Role (Más Seguro)**

Crear una API route que use el service role:

```typescript
// app/api/admin/delete-user/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin-client'

export async function DELETE(request: Request) {
  const { userId } = await request.json()
  
  try {
    // Eliminar de profiles
    await supabaseAdmin.from('profiles').delete().eq('id', userId)
    
    // Eliminar de auth.users
    await supabaseAdmin.auth.admin.deleteUser(userId)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

## 🛡️ Consideraciones de Seguridad

### **Service Role Key**
- ⚠️ **Nunca expongas** la service role key en el frontend
- ✅ **Solo úsala** en el backend o API routes
- ✅ **Guárdala** como variable de entorno secreta

### **RLS Policies**
- ✅ **Más seguro** para producción
- ✅ **Control granular** de permisos
- ✅ **Auditoría** de operaciones

## 📋 Estado Actual del Sistema

### **Lo que Funciona Ahora:**
- ✅ Crear administradores
- ✅ Listar administradores
- ✅ Desactivar administradores (eliminar de panel)
- ✅ Manejo gracioso del error 403
- ✅ Mensajes informativos para el usuario

### **Lo que Requiere Configuración Adicional:**
- ⚠️ Eliminación completa de `auth.users`
- ⚠️ Permisos de Service Role

## 🚀 Recomendación

Para **desarrollo local**, usa la **Opción A** (Service Role Key).
Para **producción**, implementa la **Opción C** (API Route con Service Role).

El sistema actual ya funciona correctamente para la mayoría de casos de uso, desactivando efectivamente a los usuarios del panel de administración.

## 📞 Soporte

Si necesitas ayuda con la configuración:
1. Verifica que tienes acceso de administrador en Supabase
2. Revisa que las variables de entorno están configuradas
3. Confirma que las políticas RLS están activas
4. Consulta los logs de Supabase para errores específicos

---

**✅ Estado**: Sistema funcional con manejo inteligente de permisos.
**🔄 Próximo paso**: Configurar Service Role para eliminación completa (opcional).
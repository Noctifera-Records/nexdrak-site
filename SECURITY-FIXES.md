# 🔒 Guía para Corregir Warnings de Seguridad en Supabase

Esta guía te ayudará a solucionar todos los warnings de seguridad detectados en tu proyecto Supabase.

## 📋 Warnings Detectados

1. **Function Search Path Mutable** (6 funciones)
2. **Auth OTP Long Expiry**
3. **Leaked Password Protection Disabled**

## 🛠️ Soluciones

### 1. Corregir Function Search Path Mutable

**Problema**: Las funciones no tienen configurado un `search_path` seguro, lo que puede permitir ataques de inyección de esquema.

**Solución**: Ejecutar el script SQL que corrige todas las funciones.

```sql
-- Ejecuta este archivo en el SQL Editor de Supabase:
sql/fix-security-warnings.sql
```

**Funciones corregidas**:
- `update_events_updated_at_column`
- `update_merch_updated_at_column`
- `update_settings_updated_at_column`
- `handle_new_user`
- `update_updated_at_column`
- `update_downloads_updated_at`

### 2. Corregir Auth OTP Long Expiry

**Problema**: El tiempo de expiración de OTP está configurado a más de 1 hora.

**Solución**: Cambiar configuración en el Dashboard de Supabase.

#### Pasos:
1. Ve a tu Dashboard de Supabase
2. Navega a **Authentication > Settings**
3. Busca la sección **"Email"**
4. Cambia **"OTP expiry"** de su valor actual a **1800** (30 minutos)
5. Haz clic en **"Save"**

### 3. Habilitar Leaked Password Protection

**Problema**: La protección contra contraseñas comprometidas está deshabilitada.

**Solución**: Habilitar la función en el Dashboard de Supabase.

#### Pasos:
1. Ve a tu Dashboard de Supabase
2. Navega a **Authentication > Settings**
3. Busca la sección **"Security and Protection"**
4. Habilita **"Enable leaked password protection"**
5. Haz clic en **"Save"**

## 🚀 Configuraciones Adicionales Recomendadas

### En Authentication > Settings > Security:
- ✅ **Enable email confirmations**: Habilitado
- ✅ **Enable phone confirmations**: Habilitado (si usas SMS)
- ✅ **Minimum password length**: 8 caracteres mínimo
- ✅ **Password strength**: Medium o Strong

### En Authentication > Settings > Email:
- ✅ **Confirm email change**: Habilitado
- ✅ **Secure email change**: Habilitado
- ✅ **OTP expiry**: 1800 segundos (30 minutos)

## 📝 Scripts Incluidos

### `sql/fix-security-warnings.sql`
- Corrige todas las funciones con search_path mutable
- Recrea los triggers con las funciones seguras
- Incluye verificación de que las funciones están correctas

### `sql/fix-auth-security-settings.sql`
- Configuraciones SQL adicionales de seguridad
- Políticas mejoradas para profiles
- Sistema de logging de autenticación (opcional)
- Función de limpieza de logs antiguos

## ✅ Verificación

Después de aplicar todas las correcciones:

1. **Ejecuta el script SQL**: `sql/fix-security-warnings.sql`
2. **Configura las opciones de autenticación** en el Dashboard
3. **Ejecuta el linter de Supabase** nuevamente para verificar que los warnings desaparecieron

### Comando para verificar funciones:
```sql
SELECT 
    proname as function_name,
    proconfig as configuration
FROM pg_proc 
WHERE proname IN (
    'update_updated_at_column',
    'update_events_updated_at_column', 
    'update_merch_updated_at_column',
    'update_settings_updated_at_column',
    'update_downloads_updated_at',
    'handle_new_user'
) 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

## 🔍 Monitoreo Continuo

Para mantener la seguridad:

1. **Ejecuta el linter regularmente**: Dashboard > Database > Linter
2. **Revisa los logs de autenticación** periódicamente
3. **Mantén actualizadas las configuraciones** de seguridad
4. **Ejecuta la limpieza de logs** mensualmente:
   ```sql
   SELECT cleanup_old_auth_logs();
   ```

## 📞 Soporte

Si encuentras algún problema al aplicar estas correcciones:

1. Verifica que tienes permisos de administrador en Supabase
2. Asegúrate de ejecutar los scripts en el orden correcto
3. Revisa los logs de error en el SQL Editor
4. Contacta al soporte de Supabase si persisten los problemas

---

**⚠️ Importante**: Estas correcciones mejorarán significativamente la seguridad de tu aplicación. Es recomendable aplicarlas lo antes posible.
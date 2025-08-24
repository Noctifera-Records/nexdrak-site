# Guía para Resolver Problemas de RLS en Supabase

## Problema Identificado

El error `new row violates row-level security policy for table "songs"` indica que las políticas de seguridad a nivel de fila (RLS) están bloqueando las operaciones CRUD en la tabla `songs`.

## Solución Rápida

### Opción 1: Crear Políticas Permisivas (Recomendado)

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `sql/fix-songs-rls-simple.sql`
3. Esto creará políticas que permiten operaciones CRUD a usuarios autenticados

### Opción 2: Deshabilitar RLS Temporalmente (Solo para Testing Rápido)

1. Ve al **SQL Editor** en tu dashboard de Supabase
2. Ejecuta el contenido del archivo `sql/disable-rls-temporarily.sql`
3. **IMPORTANTE**: Esto es solo para testing, recuerda volver a habilitar RLS después

### Opción 3: Comando Manual Rápido

Si prefieres ejecutar un comando rápido:

```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
```

## Verificación

Después de aplicar la solución, verifica que:

1. Los usuarios autenticados pueden crear canciones
2. Los usuarios autenticados pueden editar canciones existentes
3. Los usuarios autenticados pueden eliminar canciones
4. Los usuarios no autenticados pueden ver las canciones (lectura pública)

## Políticas Recomendadas

Las políticas que se crean en el script permiten:

- **SELECT**: Acceso público para leer canciones
- **INSERT**: Solo usuarios autenticados pueden crear
- **UPDATE**: Solo usuarios autenticados pueden actualizar
- **DELETE**: Solo usuarios autenticados pueden eliminar

## Monitoreo

Para verificar las políticas actuales:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'songs';
```

## Notas Importantes

- RLS es una característica de seguridad importante
- Solo deshabilítalo temporalmente si es absolutamente necesario
- Siempre usa políticas específicas en producción
- Considera implementar políticas basadas en roles de usuario para mayor seguridad

## Contacto

Si el problema persiste después de aplicar estas soluciones, verifica:

1. Que el usuario esté correctamente autenticado
2. Que las variables de entorno de Supabase sean correctas
3. Que no haya otras restricciones en la base de datos
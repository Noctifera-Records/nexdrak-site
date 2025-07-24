"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'bad_code_verifier':
        return {
          title: 'Error de Verificación',
          message: 'El enlace de verificación ha expirado o ya fue usado. Por favor, solicita un nuevo enlace de restablecimiento de contraseña.',
          suggestion: 'Intenta solicitar un nuevo enlace desde la página de login.'
        }
      case 'no_code':
        return {
          title: 'Enlace Inválido',
          message: 'El enlace de verificación no es válido o está incompleto.',
          suggestion: 'Verifica que hayas copiado el enlace completo desde tu correo electrónico.'
        }
      case 'callback_error':
        return {
          title: 'Error de Autenticación',
          message: 'Ocurrió un error durante el proceso de autenticación.',
          suggestion: 'Por favor, intenta nuevamente o contacta al soporte si el problema persiste.'
        }
      default:
        return {
          title: 'Error de Autenticación',
          message: error || 'Ocurrió un error desconocido durante la autenticación.',
          suggestion: 'Por favor, intenta nuevamente.'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold">{errorInfo.title}</h1>
          
          <p className="text-gray-300 text-lg">
            {errorInfo.message}
          </p>
          
          <p className="text-gray-400 text-sm">
            {errorInfo.suggestion}
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            asChild 
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            <Link href="/login">
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar Nuevamente
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            className="w-full border-white text-white hover:bg-white/20"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>Si el problema persiste, verifica que:</p>
          <ul className="text-left space-y-1">
            <li>• El enlace no haya expirado (válido por 1 hora)</li>
            <li>• No hayas usado el enlace anteriormente</li>
            <li>• Tu conexión a internet sea estable</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
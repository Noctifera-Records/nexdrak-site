"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'bad_code_verifier':
        return {
          title: 'Verification Error',
          message: 'The verification link has expired or has already been used. Please request a new password reset link.',
          suggestion: 'Try requesting a new link from the login page.'
        }
      case 'no_code':
        return {
          title: 'Invalid Link',
          message: 'The verification link is invalid or incomplete.',
          suggestion: 'Make sure you copied the complete link from your email.'
        }
      case 'callback_error':
        return {
          title: 'Authentication Error',
          message: 'An error occurred during the authentication process.',
          suggestion: 'Please try again or contact support if the problem persists.'
        }
      default:
        return {
          title: 'Authentication Error',
          message: error || 'An unknown error occurred during authentication.',
          suggestion: 'Please try again.'
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
              Try Again
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            className="w-full border-white text-white hover:bg-white/20"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-2">
          <p>If the problem persists, verify that:</p>
          <ul className="text-left space-y-1">
            <li>• The link has not expired (valid for 1 hour)</li>
            <li>• You have not used the link previously</li>
            <li>• Your internet connection is stable</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import Layout from '@/components/Layout'

export default function Login() {
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/profile')
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.')
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <h1 className="text-3xl font-bold mb-8">Sign In to ForkFusion</h1>
        <button
          onClick={handleGoogleSignIn}
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Sign In with Google
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </Layout>
  )
}
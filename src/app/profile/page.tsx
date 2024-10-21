'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuth } from '@/components/AuthProvider'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import Image from 'next/image'

interface FavoriteRecipe {
  id: string;
  recipeId: string;
  recipeName: string;
  recipeImage: string;
}

export default function Profile() {
  const { user } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchFavorites = async () => {
      const favoritesRef = collection(db, 'favorites')
      const q = query(favoritesRef, where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const favoritesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FavoriteRecipe[]
      setFavorites(favoritesList)
    }

    fetchFavorites()
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.displayName}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Favorite Recipes</h2>
          {favorites.length === 0 ? (
            <p>You haven&apos;t added any favorite recipes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <Link href={`/recipe/${favorite.recipeId}`} key={favorite.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200">
                    <Image src={favorite.recipeImage} alt={favorite.recipeName} width={300} height={200} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{favorite.recipeName}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
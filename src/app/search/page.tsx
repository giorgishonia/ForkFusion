'use client'

import { useState, useEffect, Suspense } from 'react' // Import Suspense from React
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { db } from '@/app/firebase'
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore'

// Your existing interface definitions
interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
}

export default function SearchResults() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResultsContent />
      </Suspense>
    </Layout>
  );
}

function SearchResultsContent() { // Extracted component for search results
  const searchParams = useSearchParams()
  const q = searchParams.get('q')
  const [results, setResults] = useState<Meal[] | null>(null) // Initialize results as null
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const mealsPerPage = 12
  const { user } = useAuth()

  useEffect(() => {
    const fetchResults = async () => {
      if (q) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
        const data = await response.json()
        setResults(data.meals || []) // Set results as an empty array if no meals found
      }
    }

    fetchResults()
  }, [q])

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, 'favorites')
        const q = query(favoritesRef, where('userId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const favoriteIds = new Set(querySnapshot.docs.map(doc => doc.data().recipeId))
        setFavorites(favoriteIds)
      }
      fetchFavorites()
    }
  }, [user])

  const toggleFavorite = async (meal: Meal) => {
    if (!user) return

    const favoriteRef = doc(db, 'favorites', `${user.uid}_${meal.idMeal}`)

    if (favorites.has(meal.idMeal)) {
      await deleteDoc(favoriteRef)
      setFavorites(prev => {
        const newFavorites = new Set(prev)
        newFavorites.delete(meal.idMeal)
        return newFavorites
      })
    } else {
      await setDoc(favoriteRef, {
        userId: user.uid,
        recipeId: meal.idMeal,
        recipeName: meal.strMeal,
        recipeImage: meal.strMealThumb,
      })
      setFavorites(prev => new Set(prev).add(meal.idMeal))
    }
  }

  const indexOfLastMeal = currentPage * mealsPerPage
  const indexOfFirstMeal = indexOfLastMeal - mealsPerPage
  const currentMeals = results ? results.slice(indexOfFirstMeal, indexOfLastMeal) : [] // Check if results is not null

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <>
      <h1 style={{ textAlign: 'center' }} className="text-3xl font-bold mb-6">Search Results for &quot;{q}&quot;</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results ? ( // Check if results is not null
          currentMeals.length > 0 ? (
            currentMeals.map((meal) => (
              <div key={meal.idMeal} className="bg-white rounded-lg shadow-md overflow-hidden h-full hover:shadow-lg transition-shadow duration-200">
                <Link href={`/recipe/${meal.idMeal}`}>
                  <div className="relative h-48">
                    <Image src={meal.strMealThumb} alt={meal.strMeal} layout="fill" objectFit="cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-semibold line-clamp-2">{meal.strMeal}</h2>
                    <button
                      onClick={() => toggleFavorite(meal)}
                      className={`p-1 rounded-full ${favorites.has(meal.idMeal) ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart size={20} fill={favorites.has(meal.idMeal) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{meal.strCategory}</p>
                </div>
              </div>
            ))
          ) : ( // Check if there are no results
            <div className="flex items-center justify-center h-64">
              <div 
                className="text-center absolute" 
                style={{ 
                  left: '50%', 
                  transform: 'translate(-50%, 20%)', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Image src="/no-result.gif" alt="No results found" width={300} height={300} />
                <p className="text-gray-600 mt-4">No results found for &apos;{q}&apos;. Please try a different search!</p>
              </div>
            </div>
          )
        ) : null} {/* Only render if results is null */}

      </div>

      {results && results.length > mealsPerPage && ( // Check if results is not null before showing pagination
        <div className="flex justify-center mt-8">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-2 px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastMeal >= (results ? results.length : 0)} // Check if results is not null
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  )
}

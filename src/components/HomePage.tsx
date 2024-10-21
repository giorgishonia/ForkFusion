'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { db } from '@/app/firebase'
import { doc, setDoc, deleteDoc, collection, getDocs, where, query as firebaseQuery } from 'firebase/firestore'

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
}

interface Category {
  strCategory: string;
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [meals, setMeals] = useState<Meal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      const data = await response.json()
      setCategories(data.categories)
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchMeals = async () => {
      let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
      if (selectedCategory) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`
      }
      const response = await fetch(url)
      const data = await response.json()
      setMeals(data.meals?.slice(0, 12) || [])
    }

    fetchMeals()
  }, [selectedCategory])

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const favoritesRef = collection(db, 'favorites');
        const favoritesQuery = firebaseQuery(favoritesRef, where('userId', '==', user.uid as string)); // Use firebaseQuery
        const querySnapshot = await getDocs(favoritesQuery);
        
        // Added type assertion for recipeId
        const favoriteIds = new Set<string>(querySnapshot.docs.map(doc => {
            const data = doc.data() as { recipeId: string }
            return data.recipeId; // Ensure recipeId is treated as a string
        }))
        
        setFavorites(favoriteIds);
      };
      fetchFavorites();
    }
  }, [user]);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const toggleFavorite = async (meal: Meal) => {
    if (!user) return;
  
    const favoriteRef = doc(db, 'favorites', `${user.uid}_${meal.idMeal}`);
  
    if (favorites.has(meal.idMeal)) {
      await deleteDoc(favoriteRef);
      setFavorites(() => {
        const newFavorites = new Set(favorites); // Use the existing favorites
        newFavorites.delete(meal.idMeal);
        return newFavorites; // Return the updated set
      });
    } else {
      await setDoc(favoriteRef, {
        userId: user.uid,
        recipeId: meal.idMeal,
        recipeName: meal.strMeal,
        recipeImage: meal.strMealThumb,
      });
      setFavorites(() => {
        const newFavorites = new Set(favorites); // Use the existing favorites
        newFavorites.add(meal.idMeal);
        return newFavorites; // Return the updated set
      });
    }
  }
  

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Delicious Recipes</h1>
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for recipes..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Search size={20} />
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === '' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.strCategory}
              onClick={() => setSelectedCategory(category.strCategory)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category.strCategory ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.strCategory}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Recipes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {meals.map((meal) => (
            <div key={meal.idMeal} className="bg-white rounded-lg shadow-md overflow-hidden h-full hover:shadow-lg transition-shadow duration-200">
              <Link href={`/recipe/${meal.idMeal}`}>
                <div className="relative h-48">
                  <Image src={meal.strMealThumb} alt={meal.strMeal} layout="fill" objectFit="cover" />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2">{meal.strMeal}</h3>
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
          ))}
        </div>
      </div>
    </div>
  )
}

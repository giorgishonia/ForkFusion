'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { db } from '../../firebase'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { Heart } from 'lucide-react'

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  strArea: string;
  strTags: string;
  [key: string]: string;
}

export default function RecipeDetails() {
  const params = useParams()
  const { id } = params
  const [recipe, setRecipe] = useState<Meal | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        const data = await response.json()
        setRecipe(data.meals[0])
      }
    }

    const checkFavorite = async () => {
      if (user && id) {
        const favoriteRef = doc(db, 'favorites', `${user.uid}_${id}`)
        const favoriteDoc = await getDoc(favoriteRef)
        setIsFavorite(favoriteDoc.exists())
      }
    }

    fetchRecipe()
    checkFavorite()
  }, [id, user])

  const toggleFavorite = async () => {
    if (!user || !recipe) return

    const favoriteRef = doc(db, 'favorites', `${user.uid}_${recipe.idMeal}`)

    if (isFavorite) {
      await deleteDoc(favoriteRef)
    } else {
      await setDoc(favoriteRef, {
        userId: user.uid,
        recipeId: recipe.idMeal,
        
        recipeName: recipe.strMeal,
        recipeImage: recipe.strMealThumb,
      })
    }

    setIsFavorite(!isFavorite)
  }

  if (!recipe) {
    return <Layout><div>Loading...</div></Layout>
  }

  const ingredients = Object.entries(recipe)
    .filter(([key, value]) => key.startsWith('strIngredient') && value)
    .map(([key, value]) => ({
      ingredient: value,
      measure: recipe[`strMeasure${key.slice(13)}`],
    }))

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 md:h-96">
          <Image src={recipe.strMealThumb} alt={recipe.strMeal} layout="fill" objectFit="cover" />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{recipe.strMeal}</h1>
            {user && (
              <button
                onClick={toggleFavorite}
                className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">{recipe.strCategory}</span>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">{recipe.strArea}</span>
            {recipe.strTags && recipe.strTags.split(',').map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">{tag.trim()}</span>
            ))}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
            <ul className="grid grid-cols-2 gap-2">
              {ingredients.map(({ ingredient, measure }, index) => (
                <li key={index} className="flex items-center">
                  <Image src={`https://www.themealdb.com/images/ingredients/${ingredient}-Small.png`} alt={ingredient} width={32} height={32} className="mr-2" />
                  <span>{measure} {ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              {recipe.strInstructions.split('.').filter(step => step.trim()).map((step, index) => (
                <li key={index}>{step.trim()}.</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  )
}
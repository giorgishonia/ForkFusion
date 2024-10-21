'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Image from 'next/image'
import Link from 'next/link'

interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      const data = await response.json()
      setCategories(data.categories)
    }

    fetchCategories()
  }, [])

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Meal Categories</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link href={`/category/${encodeURIComponent(category.strCategory)}`} key={category.idCategory}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="relative h-48">
                <Image src={category.strCategoryThumb} alt={category.strCategory} layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{category.strCategory}</h2>
                <p className="text-gray-600 line-clamp-3">{category.strCategoryDescription}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
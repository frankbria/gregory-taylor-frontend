'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])


  useEffect(() => {
    const fetchPhotos = async () => {
        try {
      //const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/photos`)
      const res = await axios.get('/api/photos')
      console.log("Photos fetched:", res.data)
      setPhotos(res.data)
        } catch (error) {
      console.error("Error fetching photos:", error)
    }
}

    fetchPhotos()
  }, [])

  return (
    <div className="bg-black min-h-screen text-white">
      <header className="text-center py-10 border-b border-gray-800">
        <h1 className="text-4xl font-serif tracking-wide">GREG TAYLOR PHOTOGRAPHY</h1>
        <nav className="mt-4 space-x-6 text-sm uppercase">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/gallery" className="hover:underline">Gallery</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </nav>
      </header>

      <main className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {photos.map(photo => (
          <div key={photo._id} className="aspect-square overflow-hidden rounded shadow hover:shadow-lg transition">
            <Image
              src={photo.imageUrl}
              alt={photo.title || 'Photo'}
              width={600}
              height={600}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </main>
    </div>
  )
}

'use client'

import EditableContent from './EditableContent'

export default function HomeContent() {
  return (
    <>
      <EditableContent pageId="home" sectionId="hero">
        <h1 className="text-3xl font-bold mb-6">Gregory Taylor Photography</h1>
        <p className="mb-4">
          Welcome to my photography portfolio. I capture moments that tell stories
          and emotions that resonate with viewers.
        </p>
      </EditableContent>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <EditableContent pageId="home" sectionId="about-work">
            <h2 className="text-xl font-semibold mb-3">About My Work</h2>
            <p>
              My photography explores the beauty in everyday scenes and extraordinary
              landscapes. Each image represents a unique perspective that invites
              viewers to see the world differently.
            </p>
          </EditableContent>
        </div>
        <div>
          <EditableContent pageId="home" sectionId="available-prints">
            <h2 className="text-xl font-semibold mb-3">Available Prints</h2>
            <p>
              All photographs on this site are available as high-quality prints in
              various sizes and formats. Browse the gallery to find pieces that speak
              to you and would complement your space.
            </p>
          </EditableContent>
        </div>
      </div>
    </>
  )
}

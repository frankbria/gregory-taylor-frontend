import { useState, useRef } from "react"
import Image from "next/image"

const ROOM_TEMPLATES = [
  {
    id: "room_1",
    label: "Living Room",
    overlay: { x: 100, y: 100, w: 500, h: 300 }
  },
  {
    id: "room_2",
    label: "Office",
    overlay: { x: 90, y: 90, w: 480, h: 280 }
  },
  {
    id: "room_3",
    label: "Gallery Wall",
    overlay: { x: 110, y: 100, w: 520, h: 320 }
  },
  {
    id: "room_4",
    label: "Bedroom",
    overlay: { x: 95, y: 95, w: 490, h: 290 }
  }
]

// Use environment variable for Cloudinary cloud name
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

function buildPreviewUrl(photoId, templateId, overlay) {
  const { x, y, w, h } = overlay
  return `https://res.cloudinary.com/${cloudName}/image/upload/` +
         `l_${photoId},w_${w},h_${h},x_${x},y_${y},c_fit/` +
         `${templateId}.png`
}

export function RoomPreviews({ photoPublicId }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [previewError, setPreviewError] = useState(false)
  const [thumbnailErrors, setThumbnailErrors] = useState({})
  const errorCountRef = useRef(0)

  const selectedTemplate = ROOM_TEMPLATES[selectedIndex]
  const mainImageUrl = buildPreviewUrl(photoPublicId, selectedTemplate.id, selectedTemplate.overlay)

  // Handle image error by showing the original photo
  const handleImageError = () => {
    setPreviewError(true)
  }

  // Handle thumbnail error with a fallback mechanism
  const handleThumbnailError = (templateId) => {
    // Only set error for this template if not already set
    if (!thumbnailErrors[templateId]) {
      setThumbnailErrors(prev => ({
        ...prev,
        [templateId]: true
      }))
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 mt-6 relative">
      {/* Main preview */}
      <div className="relative overflow-hidden rounded-lg shadow-md w-full md:w-3/4 max-w-4xl group">
        {previewError ? (
          // If preview fails, show the original photo
          <div className="relative w-full h-[500px]">
            <Image
              src={`https://res.cloudinary.com/${cloudName}/image/upload/${photoPublicId}`}
              alt="Original photo"
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-4 text-center">
              <p>Preview not available.</p>
            </div>
          </div>
        ) : (
          <Image
            src={mainImageUrl}
            alt={`Room preview - ${selectedTemplate.label}`}
            width={1000}
            height={700}
            className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 mt-4 md:mt-0 md:absolute md:top-0 md:right-0 p-2 bg-white bg-opacity-80 rounded-md shadow">
        {ROOM_TEMPLATES.map((template, index) => {
          const thumbUrl = buildPreviewUrl(photoPublicId, template.id, template.overlay)
          const isSelected = index === selectedIndex
          const hasError = thumbnailErrors[template.id]

          return (
            <div
              key={template.id}
              onClick={() => setSelectedIndex(index)}
              className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${
                isSelected ? "border-blue-600 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              {hasError ? (
                // Show a placeholder if there was an error
                <div className="w-[100px] h-[75px] bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  {template.label}
                </div>
              ) : (
                <Image
                  src={thumbUrl}
                  alt={`Thumbnail - ${template.label}`}
                  width={100}
                  height={75}
                  className="object-cover"
                  onError={() => handleThumbnailError(template.id)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

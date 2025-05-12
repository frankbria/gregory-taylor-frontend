import Image from "next/image";
import PhotoSlider from "@/components/PhotoSlider";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Full-width photo slider */}
      <PhotoSlider />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Gregory Taylor Photography</h1>
          <p className="mb-4">
            Welcome to my photography portfolio. I capture moments that tell stories
            and emotions that resonate with viewers.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">About My Work</h2>
              <p>
                My photography explores the beauty in everyday scenes and extraordinary
                landscapes. Each image represents a unique perspective that invites
                viewers to see the world differently.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-3">Available Prints</h2>
              <p>
                All photographs on this site are available as high-quality prints in
                various sizes and formats. Browse the gallery to find pieces that speak
                to you and would complement your space.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/gallery"
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import PhotoSlider from "@/components/PhotoSlider";
import Link from "next/link";
import HomeContent from "@/components/HomeContent";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Full-width photo slider */}
      <PhotoSlider />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <HomeContent />

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

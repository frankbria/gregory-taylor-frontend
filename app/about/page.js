/* eslint-disable react/no-unescaped-entities */
import Image from 'next/image'
import { AboutStory, AboutApproach } from '@/components/AboutContent'

export const metadata = {
  title: 'About | Greg Taylor Photography',
  description: 'Learn more about Greg Taylor and his passion for nature photography',
}

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold mb-12 text-center">About the Photographer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Profile image */}
        <div className="md:col-span-5 md:sticky md:top-24 self-start">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg shadow-lg">
            <Image 
              src="/Greg-600x600.jpg" 
              alt="Greg Taylor" 
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
              priority
            />
          </div>
          
          <div className="mt-6 bg-gray-100 p-6 rounded-lg border-l-4 border-gray-800">
            <p className="text-lg italic font-light text-gray-700">
              &quot;It&apos;s not the camera that matters, but the person behind the camera&quot;
            </p>
            <p className="mt-2 text-right text-sm text-gray-500">— Photography wisdom</p>
          </div>
        </div>
        
        {/* Content sections */}
        <div className="md:col-span-7 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4 inline-block border-b-2 border-gray-800 pb-1">My Story</h2>
            <AboutStory />
          </section>
          
          {/* Quote block */}
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-700">
            &quot;Photography is not about capturing what something looks like, but what it feels like in that moment.&quot;
          </blockquote>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 inline-block border-b-2 border-gray-800 pb-1">My Approach</h2>
            <AboutApproach />
          </section>
          
          {/* Final quote */}
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-700">
            &quot;I don&apos;t just take pictures. I preserve memories, capture emotions, and share perspectives.&quot;
          </blockquote>
          
          <div className="bg-gray-200 p-8 rounded-lg mt-10 border border-gray-300">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Let's Connect</h3>
            <p className="leading-relaxed mb-5 text-gray-700">
              Interested in working together or purchasing a print? Feel free to reach out and let's create something beautiful together.
            </p>
            <div className="flex justify-center sm:justify-start">
              <a 
                href="/contact" 
                className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition duration-300"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
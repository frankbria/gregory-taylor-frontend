/* eslint-disable react/no-unescaped-entities */
import Image from 'next/image'

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
            
            <p className="leading-relaxed mb-4">
              National Geographic photographer and use my photography to drive wildlife conservation work around the world. In college I saved up enough money to buy my first camera, a point and shoot (Canon Powershot S120), by donating plasma. I literally &quot;sold&quot; my body to buy my first camera. That became one of my greatest investments to date.
            </p>
            
            <p className="leading-relaxed mb-4">
              Through that camera I developed the skills, techniques, and passion that have aided me in becoming the photographer that I am. When I first started taking photos, I was frustrated by the fact that my appreciation for powerful photographs was not matched in my ability to take what I would deem &apos;moving pieces of art&apos;.
            </p>
            
            <p className="leading-relaxed mb-4">
              I was also self-conscious of the fact that I used a point and shoot camera while professional photographers had far superior cameras. As I battled with this self-consciousness I came across the quote, &quot;It&apos;s not the camera that matters, but the person behind the camera&quot;. I quickly took this to heart and started practicing photography without judging myself. I learned to use that camera to create powerful and moving photographs. In fact, many of the images found in my gallery were taken on that point and shoot camera.
            </p>
            
            <p className="leading-relaxed">
              It has been five years since I invested in that point and shoot camera. I have since upgraded to a DSLR and strive to use it to create moving pieces of art that portray the beautiful world we live in.
            </p>
          </section>
          
          {/* Quote block */}
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-700">
            &quot;Photography is not about capturing what something looks like, but what it feels like in that moment.&quot;
          </blockquote>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4 inline-block border-b-2 border-gray-800 pb-1">My Approach</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Patience</h3>
                <p className="text-gray-700">The perfect shot requires waiting for the right moment, sometimes for hours or even days.</p>
              </div>
              
              <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Perspective</h3>
                <p className="text-gray-700">I'm always looking for unique angles and viewpoints that show familiar subjects in new ways.</p>
              </div>
              
              <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Light</h3>
                <p className="text-gray-700">Understanding light is fundamental. I often work during golden hour to capture magical moments.</p>
              </div>
              
              <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
                <h3 className="text-lg font-medium mb-2 text-gray-800">Connection</h3>
                <p className="text-gray-700">Every photograph should tell a story and create an emotional connection with the viewer.</p>
              </div>
            </div>
            
            <p className="leading-relaxed mb-4">
              I recently moved to the beautiful desert of the American Southwest where I work full-time educating the public about rattlesnakes and their role in this eco-region, and as a photographer in my spare time.
            </p>
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
'use client'

import Image from 'next/image'
import { FaFacebookSquare, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import withInspector from '@/lib/withInspector'

function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800 mt-12 py-10 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y- 6 md:flex-row md:justify-center md:space-y-0 md:gap-16">

        {/* Photo */}
        <div className="flex-shrink-0">
          <Image
            src="/Greg-600x600.jpg" // Replace with your local or Cloudinary URL
            alt="Greg Taylor"
            width={240}
            height={240}
            className="rounded shadow"
          />
        </div>

        {/* Social + Contact */}
        <div className="flex flex-col items-center md:items-start space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-sm tracking-widest text-gray-400 uppercase mb-1">Follow</h3>
            <div className="flex gap-6 text-2xl">
              <a href="https://www.facebook.com/gregory.w.taylor.5?ref=bookmarks" target="_blank" rel="noreferrer">
                <FaFacebookSquare className="hover:text-blue-500 transition" />
              </a>
              <a href="https://www.instagram.com/gregtaylor22/" target="_blank" rel="noreferrer">
                <FaInstagram className="hover:text-pink-500 transition" />
              </a>
              <a href="https://www.linkedin.com/in/gregory-taylor/" target="_blank" rel="noreferrer">
                <FaLinkedinIn className="hover:text-blue-300 transition" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm tracking-widest text-gray-400 uppercase mb-1">Contact</h3>
            <a href="/contact" className="hover:underline text-sm text-gray-300">
              Contact Greg Taylor
            </a>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="max-w-2xl mx-auto mt-8 text-center text-sm text-gray-400 px-4 leading-relaxed">
        Greg Taylor is a fine art landscape photographer based out of the Phoenix area. He specializes in the deserts of the Southwest, but you will find images from around the world in the galleries. He has spent the past 8 years practicing landscape photography across the world. Click here to learn more about him.
      </div>
    </footer>
  )
}

export default withInspector(Footer, {
  componentName: 'Footer',
  filePath: 'components/Footer.jsx',
})

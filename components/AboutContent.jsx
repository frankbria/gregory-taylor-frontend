'use client'

import EditableContent from './EditableContent'

export function AboutStory() {
  return (
    <EditableContent pageId="about" sectionId="story">
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
    </EditableContent>
  )
}

export function AboutApproach() {
  return (
    <EditableContent pageId="about" sectionId="approach">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-medium mb-2 text-gray-800">Patience</h3>
          <p className="text-gray-700">The perfect shot requires waiting for the right moment, sometimes for hours or even days.</p>
        </div>

        <div className="bg-gray-200 p-5 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-medium mb-2 text-gray-800">Perspective</h3>
          <p className="text-gray-700">I&apos;m always looking for unique angles and viewpoints that show familiar subjects in new ways.</p>
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
    </EditableContent>
  )
}

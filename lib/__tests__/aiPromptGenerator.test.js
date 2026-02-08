import {
  generateInspectorPrompt,
  generateCloudinaryPrompt,
  copyPromptToClipboard,
} from '@/lib/aiPromptGenerator'

describe('aiPromptGenerator', () => {
  describe('generateInspectorPrompt', () => {
    it('generates a prompt with component info', () => {
      const metadata = {
        componentName: 'Header',
        filePath: 'components/Header.jsx',
        className: 'bg-black text-white py-6',
      }

      const prompt = generateInspectorPrompt('header-1', metadata)
      expect(prompt).toContain('header-1')
      expect(prompt).toContain('Header')
      expect(prompt).toContain('components/Header.jsx')
      expect(prompt).toContain('bg-black text-white py-6')
    })

    it('includes instruction placeholder', () => {
      const metadata = {
        componentName: 'Footer',
        filePath: 'components/Footer.jsx',
        className: 'bg-black',
      }

      const prompt = generateInspectorPrompt('footer-1', metadata)
      expect(prompt).toContain('[Your instruction here]')
    })

    it('handles missing className gracefully', () => {
      const metadata = {
        componentName: 'Header',
        filePath: 'components/Header.jsx',
      }

      const prompt = generateInspectorPrompt('header-1', metadata)
      expect(prompt).toContain('Header')
      expect(prompt).toContain('none')
    })

    it('includes extra metadata props when provided', () => {
      const metadata = {
        componentName: 'CloudinaryImage',
        filePath: 'components/CloudinaryImage.jsx',
        className: 'object-cover',
        props: { src: 'photo.jpg', alt: 'Test photo' },
      }

      const prompt = generateInspectorPrompt('img-1', metadata)
      expect(prompt).toContain('CloudinaryImage')
      expect(prompt).toContain('src')
    })

    it('handles circular references in props gracefully', () => {
      const circular = { name: 'test' }
      circular.self = circular

      const metadata = {
        componentName: 'Header',
        filePath: 'components/Header.jsx',
        props: circular,
      }

      const prompt = generateInspectorPrompt('header-1', metadata)
      expect(prompt).toContain('unable to serialize')
    })
  })

  describe('generateCloudinaryPrompt', () => {
    it('generates a prompt with Cloudinary-specific details', () => {
      const metadata = {
        componentName: 'CloudinaryImage',
        filePath: 'components/CloudinaryImage.jsx',
        className: 'object-cover',
        cloudinary: {
          src: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          quality: 'auto',
          format: 'auto',
          width: 800,
        },
      }

      const prompt = generateCloudinaryPrompt('img-1', metadata)
      expect(prompt).toContain('img-1')
      expect(prompt).toContain('CloudinaryImage')
      expect(prompt).toContain('quality')
      expect(prompt).toContain('auto')
      expect(prompt).toContain('800')
    })

    it('includes adjustment guidance', () => {
      const metadata = {
        componentName: 'CloudinaryImage',
        filePath: 'components/CloudinaryImage.jsx',
        cloudinary: {
          src: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
          quality: 'auto',
        },
      }

      const prompt = generateCloudinaryPrompt('img-1', metadata)
      expect(prompt).toContain('quality')
      expect(prompt).toContain('[Your instruction here]')
    })
  })

  describe('copyPromptToClipboard', () => {
    it('copies text to clipboard', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: { writeText: mockWriteText },
      })

      await copyPromptToClipboard('test prompt')
      expect(mockWriteText).toHaveBeenCalledWith('test prompt')
    })

    it('returns true on success', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      })

      const result = await copyPromptToClipboard('test prompt')
      expect(result).toBe(true)
    })

    it('returns false on failure', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockRejectedValue(new Error('fail')) },
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = await copyPromptToClipboard('test prompt')
      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })
  })
})

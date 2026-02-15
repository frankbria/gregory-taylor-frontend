/**
 * Tests for lib/admin-db.js — SQLite database helper with migrations
 * Uses in-memory database (:memory:) for test isolation
 */

// Force in-memory database for all tests
process.env.ADMIN_DB_PATH = ':memory:'

// We need to mock better-sqlite3 to return an in-memory DB
// but also need real SQLite functionality for integration-style tests.
// Since better-sqlite3 is a native module, we'll use it directly with :memory:

let db, getAllPages, getPage, upsertPage, getSetting, upsertSetting, getPhotoSettings, upsertPhotoSettings, createDb

beforeEach(() => {
  // Re-import fresh module for each test to get clean :memory: DB
  jest.resetModules()
  process.env.ADMIN_DB_PATH = ':memory:'
  const adminDb = require('../admin-db')
  db = adminDb.db
  getAllPages = adminDb.getAllPages
  getPage = adminDb.getPage
  upsertPage = adminDb.upsertPage
  getSetting = adminDb.getSetting
  upsertSetting = adminDb.upsertSetting
  getPhotoSettings = adminDb.getPhotoSettings
  upsertPhotoSettings = adminDb.upsertPhotoSettings
})

afterEach(() => {
  if (db && db.open) {
    db.close()
  }
})

describe('admin-db', () => {
  describe('table creation (migrations)', () => {
    it('should create the pages table on import', () => {
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='pages'"
      ).all()
      expect(tables).toHaveLength(1)
      expect(tables[0].name).toBe('pages')
    })

    it('should create the settings table on import', () => {
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='settings'"
      ).all()
      expect(tables).toHaveLength(1)
      expect(tables[0].name).toBe('settings')
    })

    it('should create the photo_image_settings table on import', () => {
      const tables = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='photo_image_settings'"
      ).all()
      expect(tables).toHaveLength(1)
      expect(tables[0].name).toBe('photo_image_settings')
    })
  })

  describe('Pages CRUD', () => {
    it('getAllPages should return empty array when no pages exist', () => {
      const pages = getAllPages()
      expect(pages).toEqual([])
    })

    it('upsertPage should insert a new page', () => {
      const result = upsertPage('home', 'Home Page', '<p>Welcome</p>')
      expect(result.changes).toBe(1)
    })

    it('getPage should retrieve a page by id', () => {
      upsertPage('home', 'Home Page', '<p>Welcome</p>')
      const page = getPage('home')
      expect(page).toBeDefined()
      expect(page.id).toBe('home')
      expect(page.title).toBe('Home Page')
      expect(page.content).toBe('<p>Welcome</p>')
      expect(page.createdAt).toBeDefined()
      expect(page.updatedAt).toBeDefined()
    })

    it('getPage should return undefined for non-existent page', () => {
      const page = getPage('nonexistent')
      expect(page).toBeUndefined()
    })

    it('upsertPage should update an existing page', () => {
      upsertPage('home', 'Home Page', '<p>Welcome</p>')
      upsertPage('home', 'Home Page Updated', '<p>New content</p>')
      const page = getPage('home')
      expect(page.title).toBe('Home Page Updated')
      expect(page.content).toBe('<p>New content</p>')
    })

    it('getAllPages should return all inserted pages', () => {
      upsertPage('home', 'Home', '')
      upsertPage('about', 'About', '')
      upsertPage('contact', 'Contact', '')
      const pages = getAllPages()
      expect(pages).toHaveLength(3)
      const ids = pages.map(p => p.id)
      expect(ids).toContain('home')
      expect(ids).toContain('about')
      expect(ids).toContain('contact')
    })
  })

  describe('Settings CRUD', () => {
    it('getSetting should return undefined for non-existent key', () => {
      const setting = getSetting('nonexistent')
      expect(setting).toBeUndefined()
    })

    it('upsertSetting should insert a new setting', () => {
      const value = JSON.stringify({ theme: 'dark' })
      const result = upsertSetting('layout', value)
      expect(result.changes).toBe(1)
    })

    it('getSetting should retrieve a setting by key', () => {
      const value = JSON.stringify({ theme: 'dark' })
      upsertSetting('layout', value)
      const setting = getSetting('layout')
      expect(setting).toBeDefined()
      expect(setting.key).toBe('layout')
      expect(setting.value).toBe(value)
      expect(JSON.parse(setting.value)).toEqual({ theme: 'dark' })
    })

    it('upsertSetting should update an existing setting', () => {
      upsertSetting('layout', JSON.stringify({ theme: 'dark' }))
      upsertSetting('layout', JSON.stringify({ theme: 'light' }))
      const setting = getSetting('layout')
      expect(JSON.parse(setting.value)).toEqual({ theme: 'light' })
    })
  })

  describe('Photo Settings CRUD', () => {
    it('getPhotoSettings should return undefined for non-existent photoId', () => {
      const settings = getPhotoSettings('photo-999')
      expect(settings).toBeUndefined()
    })

    it('upsertPhotoSettings should insert new photo settings', () => {
      const settings = JSON.stringify({ quality: 80, sharpen: true })
      const result = upsertPhotoSettings('photo-1', settings)
      expect(result.changes).toBe(1)
    })

    it('getPhotoSettings should retrieve settings by photoId', () => {
      const settings = JSON.stringify({ quality: 80, sharpen: true })
      upsertPhotoSettings('photo-1', settings)
      const row = getPhotoSettings('photo-1')
      expect(row).toBeDefined()
      expect(row.photoId).toBe('photo-1')
      expect(JSON.parse(row.settings)).toEqual({ quality: 80, sharpen: true })
    })

    it('upsertPhotoSettings should update existing photo settings', () => {
      upsertPhotoSettings('photo-1', JSON.stringify({ quality: 80 }))
      upsertPhotoSettings('photo-1', JSON.stringify({ quality: 95, blur: 5 }))
      const row = getPhotoSettings('photo-1')
      expect(JSON.parse(row.settings)).toEqual({ quality: 95, blur: 5 })
    })
  })
})

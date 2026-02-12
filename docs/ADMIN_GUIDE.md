# Admin User Guide - Gregory Taylor Photography

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Logging In](#2-logging-in)
3. [Content Management](#3-content-management)
4. [Layout Configuration](#4-layout-configuration)
5. [Image Management](#5-image-management)
6. [Publishing Changes](#6-publishing-changes)
7. [Troubleshooting](#7-troubleshooting)

## 1. Getting Started

This guide helps you manage your photography website without technical knowledge.

**What You Can Do:**
- Edit text content on pages
- Modify layout and styling of site sections
- Upload and manage images
- Configure image optimization settings
- Preview changes before publishing

**What You Need:**
- Admin account credentials
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

## 2. Logging In

1. Navigate to your site's `/admin/login` page
2. Enter your email and password
3. Click "Log In"
4. You'll be redirected to the admin dashboard

The dashboard shows quick-access cards to all admin features.

## 3. Content Management

### Editing Page Content

1. From the admin dashboard, click "Content"
2. Select the page you want to edit from the list
3. Click on the page title to open the editor
4. Use the rich text toolbar for formatting (bold, italic, headings, lists, links)
5. Click "Save" to persist your changes

### Page List

The content page shows all editable pages with options to:
- **Edit**: Open the page in the rich text editor
- **Delete**: Remove a page (use with caution)

## 4. Layout Configuration

### Accessing Layout Settings

1. From the admin dashboard, click "Layout"
2. You'll see two sections: **Global Settings** and **Component Styling**

### Global Settings

Control site-wide layout options:

**Visibility:**
- Toggle "Show Header" and "Show Footer" to hide/show these sections
- Useful for creating landing pages or special layouts

**Grid Columns:**
- Controls the number of columns in gallery grids (1-12)
- Lower numbers = larger photos, higher numbers = more photos per row

**Color Scheme:**
- Choose between Light and Dark themes

**Navigation Items:**
- Add, edit, or remove links in the site navigation
- Each item has a Label (display text) and URL (link destination)
- Click "Add Nav Item" to add new links
- Click "Remove" to delete a link

Click "Save" to apply global settings, or "Reset to Defaults" to revert.

### Component Styling

Fine-tune the appearance of individual site sections using Tailwind CSS classes.

**Step 1 - Select a Component:**
- The left panel shows a tree of site sections: Header, Hero, Gallery Grid, Photo Detail, Footer
- Click the expand arrow to see sub-components (Logo, Navigation, Title, etc.)
- Click a component name to select it for editing
- Use the search box to quickly find components

**Step 2 - Edit Styles:**
The right panel shows a tabbed editor with six categories:

| Tab | What It Controls |
|-----|-----------------|
| Spacing | Margins, padding, and gaps between elements |
| Sizing | Width, height, and minimum dimensions |
| Layout | Display type (flex, grid), alignment, and direction |
| Colors | Background, text, and border colors |
| Typography | Font size, weight, and text alignment |
| Effects | Borders, border radius, and shadows |

- Select values from the dropdowns or radio buttons
- Changes appear immediately as tags above the editor
- Use "Add Custom Class" to type any Tailwind class manually

**Step 3 - Manage Class Tags:**
- Current classes appear as color-coded tags above the tree
- Colors indicate the category (blue = spacing, green = sizing, etc.)
- Click the X on any tag to remove that class

**Step 4 - Save:**
- Click "Save" in the Component Styling toolbar
- An orange dot appears next to "Component Styling" when you have unsaved changes
- Click "Revert" to discard all unsaved changes

**Additional Tools:**
- **Preview**: Opens the site in a new tab to see your changes
- **Export**: Downloads the current component styles as a JSON file (for backup)
- **Import**: Loads component styles from a previously exported JSON file

## 5. Image Management

### Global Image Settings

1. From the admin dashboard, click "Images"
2. The top section shows global image defaults:
   - **Quality**: Image compression level
   - **Sharpen**: Sharpening intensity
   - **Blur**: Blur effect (usually 0)
   - **Format**: Auto-optimized format (recommended)

### Per-Photo Settings

1. Below global settings, browse the photo gallery grid
2. Click on a photo to open its individual settings
3. Override any global setting for that specific photo
4. A live preview shows how the image will look with your settings
5. Click "Save" to apply changes

Images are automatically optimized for different screen sizes through Cloudinary.

## 6. Publishing Changes

### How Changes Work

- **Content changes**: Saved immediately when you click "Save"
- **Layout changes**: Saved immediately when you click "Save"
- **Image settings**: Saved immediately when you click "Save"

All changes take effect on the live site after saving. There is no separate "publish" step.

### Previewing Changes

Before saving layout changes:
1. Click the "Preview" button in the Component Styling toolbar
2. A new tab opens showing the current site
3. Note: Preview shows the *currently saved* state, not unsaved changes

### Reverting Changes

If something doesn't look right:
- **Layout**: Click "Revert" to discard unsaved changes
- **Global settings**: Click "Reset to Defaults"
- **Content**: Re-edit the page and undo your changes

## 7. Troubleshooting

### Common Issues

**Changes Not Saving:**
- Check your internet connection
- Ensure you're still logged in (session may have expired)
- Try refreshing the page and saving again
- Look for error messages in red toast notifications

**Layout Looks Broken:**
- Click "Revert" to undo unsaved component style changes
- Use "Reset to Defaults" for global settings
- Import a previously exported layout JSON backup

**Images Not Loading:**
- Check that the Cloudinary cloud name is configured correctly
- Verify the image exists in the Cloudinary dashboard
- Try clearing your browser cache

**Can't Log In:**
- Verify your email and password
- Ensure you have an admin account (regular users can't access admin)
- Try clearing browser cookies and cache

### Getting Help

If you encounter issues that this guide doesn't address:
1. Note what you were trying to do
2. Screenshot any error messages
3. Note which browser you're using
4. Contact your site administrator

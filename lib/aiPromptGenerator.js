/**
 * Generates AI-ready prompts from inspector element metadata.
 * Used by the dev-mode inspector to help non-technical users
 * communicate UI changes to AI coding agents like Claude Code.
 */

export function generateInspectorPrompt(elementId, metadata) {
  const { componentName, filePath, className, props } = metadata

  let prompt = `Element ID: ${elementId}\n`
  prompt += `Component: ${componentName} at ${filePath}\n`
  prompt += `Current classes: '${className || 'none'}'\n`

  if (props) {
    try {
      const propSummary = Object.entries(props)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(', ')
      prompt += `Props: ${propSummary}\n`
    } catch {
      prompt += `Props: [unable to serialize]\n`
    }
  }

  prompt += `\nInstruction: [Your instruction here]`

  return prompt
}

export function generateCloudinaryPrompt(elementId, metadata) {
  const { componentName, filePath, cloudinary } = metadata

  let prompt = `Element ID: ${elementId}\n`
  prompt += `Component: ${componentName} at ${filePath}\n`

  if (cloudinary) {
    prompt += `\nCloudinary Settings:\n`
    prompt += `  Source: ${cloudinary.src || 'unknown'}\n`
    prompt += `  Quality: ${cloudinary.quality || 'auto'}\n`
    prompt += `  Format: ${cloudinary.format || 'auto'}\n`
    if (cloudinary.width) {
      prompt += `  Width: ${cloudinary.width}\n`
    }
  }

  prompt += `\nInstruction: [Your instruction here]`
  prompt += `\n\nTip: To adjust image clarity, modify the quality parameter (1-100, higher = clearer but larger file).`
  prompt += ` To sharpen, add e_sharpen to the Cloudinary transformation URL.`

  return prompt
}

export async function copyPromptToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy prompt to clipboard:', error)
    return false
  }
}

/**
 * Safely copies text to clipboard with fallback support
 * @param text The text to copy to clipboard
 * @returns Promise that resolves if copy was successful, rejects otherwise
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Clipboard API is not available in this environment');
  }

  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      // If clipboard API fails (permission denied, etc.), fall back to execCommand
      console.warn('Clipboard API failed, using fallback method:', error);
    }
  }

  // Fallback to execCommand for older browsers or when Clipboard API fails
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (!successful) {
      throw new Error('execCommand copy failed');
    }
  } catch (error) {
    throw new Error(`Failed to copy text to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


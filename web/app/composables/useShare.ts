/**
 * Composable for sharing articles
 * Copies the article link to clipboard so users can share it
 */

import { toast } from 'vue-sonner'

export function useShare() {
  /**
   * Get the full URL for an article
   */
  const getArticleUrl = (article: { slug?: string; id: string }): string => {
    const baseUrl = window.location.origin
    if (article.slug) {
      return `${baseUrl}/articles/read/${article.slug}`
    }
    // Fallback to ID if no slug (shouldn't happen for published articles)
    return `${baseUrl}/articles/${article.id}`
  }

  /**
   * Copy text to clipboard with fallback for older browsers
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        console.error('Clipboard API failed:', err)
        // Fall through to fallback
      }
    }

    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr)
      return false
    }
  }

  /**
   * Share article by copying its link to clipboard
   */
  const shareArticle = async (article: { slug?: string; id: string; title: string }): Promise<void> => {
    const url = getArticleUrl(article)
    const success = await copyToClipboard(url)
    
    if (success) {
      toast.success('Link copied', {
        description: 'Article link has been copied to clipboard. You can now share it.',
      })
    } else {
      toast.error('Failed to copy', {
        description: 'Could not copy link to clipboard. Please try again.',
      })
    }
  }

  return {
    shareArticle,
    getArticleUrl,
  }
}


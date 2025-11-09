/**
 * Validation utility functions
 */

import { REGEX_PATTERNS } from '~/config'

export const validation = {
  /**
   * Check if email is valid
   */
  isEmail(value: string): boolean {
    return REGEX_PATTERNS.EMAIL.test(value)
  },

  /**
   * Check if URL is valid
   */
  isUrl(value: string): boolean {
    return REGEX_PATTERNS.URL.test(value)
  },

  /**
   * Check if phone number is valid
   */
  isPhone(value: string): boolean {
    return REGEX_PATTERNS.PHONE.test(value)
  },

  /**
   * Check if string contains only alphanumeric characters
   */
  isAlphanumeric(value: string): boolean {
    return REGEX_PATTERNS.ALPHANUMERIC.test(value)
  },

  /**
   * Check if string is a valid slug
   */
  isSlug(value: string): boolean {
    return REGEX_PATTERNS.SLUG.test(value)
  },

  /**
   * Check if value is empty
   */
  isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim().length === 0
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },

  /**
   * Check if string length is within range
   */
  isLength(value: string, min: number, max?: number): boolean {
    const length = value.length
    if (length < min) return false
    if (max !== undefined && length > max) return false
    return true
  },

  /**
   * Check if number is within range
   */
  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  },

  /**
   * Check if value matches pattern
   */
  matches(value: string, pattern: RegExp): boolean {
    return pattern.test(value)
  },

  /**
   * Check if file size is within limit
   */
  isFileSizeValid(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes
  },

  /**
   * Check if file type is allowed
   */
  isFileTypeValid(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type?.startsWith(baseType ?? '') ?? false
      }
      return file.type === type
    })
  },
}

/**
 * Validation error messages
 */
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
  min: (field: string, min: number) => `${field} must be at least ${min}`,
  max: (field: string, max: number) => `${field} must not exceed ${max}`,
  pattern: (field: string) => `${field} format is invalid`,
  fileSize: (maxSize: string) => `File size must not exceed ${maxSize}`,
  fileType: (types: string) => `File type must be ${types}`,
}


/**
 * Media upload service
 */

import type { ApiClient } from './api-client'

export interface UploadResponse {
  url: string
  key: string
  contentType: string
  size: number
}

export class MediaService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Upload an image file
   */
  async uploadImage(file: File, folder = 'articles'): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    return this.apiClient.uploadFile<UploadResponse>('/media/upload', formData)
  }

  /**
   * Upload an image from URL
   */
  async uploadFromUrl(url: string, folder = 'articles'): Promise<UploadResponse> {
    return this.apiClient.post<UploadResponse>('/media/upload-url', {
      url,
      folder,
    })
  }
}



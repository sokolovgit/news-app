/**
 * Complaints API service
 */

import type { ApiClient } from './api-client'

export type ComplaintTargetType = 'source' | 'post'
export type ComplaintReason =
  | 'spam'
  | 'inappropriate_content'
  | 'misinformation'
  | 'copyright_violation'
  | 'harassment'
  | 'other'

export interface CreateComplaintRequest {
  targetType: ComplaintTargetType
  targetId: string
  reason: ComplaintReason
  description?: string
}

export interface ComplaintResponse {
  id: string
  targetType: ComplaintTargetType
  targetId: string
  reason: ComplaintReason
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected'
  reportedBy: string
  resolvedBy?: string
  resolvedAt?: string
  resolutionNote?: string
  createdAt: string
  updatedAt: string
}

export interface CreateComplaintResponse {
  complaint: ComplaintResponse
}

export class ComplaintsService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Create a complaint for a source or post
   */
  async createComplaint(data: CreateComplaintRequest): Promise<CreateComplaintResponse> {
    return this.apiClient.post<CreateComplaintResponse>('/complaints', data)
  }
}


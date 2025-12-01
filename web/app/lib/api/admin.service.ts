/**
 * Admin API service
 * Provides admin-specific API methods
 */

import type { ApiClient } from './api-client'

// Complaint Types
export type ComplaintStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected'
export type ComplaintTargetType = 'source' | 'post'
export type ComplaintReason =
  | 'spam'
  | 'inappropriate_content'
  | 'misinformation'
  | 'copyright_violation'
  | 'harassment'
  | 'other'

export interface ComplaintReporter {
  id: string
  email: string
  roles?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface ComplaintResolver {
  id: string
  email: string
  roles?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Complaint {
  id: string
  targetType: ComplaintTargetType
  targetId: string
  reason: ComplaintReason
  description?: string
  status: ComplaintStatus
  reportedBy: string
  reporter?: ComplaintReporter
  resolvedBy?: string
  resolver?: ComplaintResolver
  resolvedAt?: string
  resolutionNote?: string
  createdAt: string
  updatedAt: string
}

export interface GetComplaintsParams {
  status?: ComplaintStatus
  targetType?: ComplaintTargetType
  targetId?: string
  reportedBy?: string
  sortField?: 'createdAt' | 'updatedAt' | 'status'
  sortOrder?: 'asc' | 'desc'
  offset?: number
  limit?: number
}

export interface GetComplaintsResponse {
  data: Complaint[]
  total: number
  offset: number
  limit: number
}

export interface ResolveComplaintRequest {
  resolutionNote?: string
}

export interface RejectComplaintRequest {
  resolutionNote?: string
}

// Stats Types
export interface AdminStats {
  totalUsers: number
  totalSources: number
  totalArticles: number
  pendingComplaints: number
  recentActivity: RecentActivity[]
}

export interface RecentActivity {
  id: string
  type: 'complaint' | 'user' | 'source' | 'article'
  action: string
  timestamp: string
  details?: string
}

export class AdminService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get complaints with optional filters
   */
  async getComplaints(params: GetComplaintsParams = {}): Promise<GetComplaintsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.status) queryParams.append('status', params.status)
    if (params.targetType) queryParams.append('targetType', params.targetType)
    if (params.targetId) queryParams.append('targetId', params.targetId)
    if (params.reportedBy) queryParams.append('reportedBy', params.reportedBy)
    if (params.sortField) queryParams.append('sortField', params.sortField)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())

    const query = queryParams.toString()
    const url = query ? `/complaints?${query}` : '/complaints'
    
    return this.apiClient.get<GetComplaintsResponse>(url)
  }

  /**
   * Resolve a complaint (admin only)
   */
  async resolveComplaint(complaintId: string, data: ResolveComplaintRequest = {}): Promise<Complaint> {
    return this.apiClient.post<Complaint>(`/complaints/${complaintId}/resolve`, data)
  }

  /**
   * Reject a complaint (admin only)
   */
  async rejectComplaint(complaintId: string, data: RejectComplaintRequest = {}): Promise<Complaint> {
    return this.apiClient.post<Complaint>(`/complaints/${complaintId}/reject`, data)
  }

  /**
   * Mark complaint as reviewed (admin only)
   */
  async reviewComplaint(complaintId: string): Promise<Complaint> {
    return this.apiClient.post<Complaint>(`/complaints/${complaintId}/review`, {})
  }

  /**
   * Get admin dashboard stats
   */
  async getStats(): Promise<AdminStats> {
    const complaints = await this.getComplaints({ status: 'pending', limit: 1 })
    
    return {
      totalUsers: 0, // Would need a users count endpoint
      totalSources: 0, // Would need a sources count endpoint
      totalArticles: 0, // Would need an articles count endpoint
      pendingComplaints: complaints.total,
      recentActivity: []
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(params: {
    offset?: number
    limit?: number
    search?: string
    sortField?: 'createdAt' | 'email'
    sortOrder?: 'asc' | 'desc'
  }): Promise<GetComplaintsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.sortField) queryParams.append('sortField', params.sortField)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    const url = query ? `/admin/users?${query}` : '/admin/users'
    
    return this.apiClient.get<GetComplaintsResponse>(url)
  }

  /**
   * Get all sources (admin only)
   */
  async getAllSources(params: {
    offset?: number
    limit?: number
    search?: string
    sourceType?: 'telegram' | 'instagram' | 'rss' | 'twitter'
    sortField?: 'createdAt' | 'updatedAt' | 'name'
    sortOrder?: 'asc' | 'desc'
  }): Promise<GetComplaintsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.sourceType) queryParams.append('sourceType', params.sourceType)
    if (params.sortField) queryParams.append('sortField', params.sortField)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    const url = query ? `/admin/sources?${query}` : '/admin/sources'
    
    return this.apiClient.get<GetComplaintsResponse>(url)
  }

  /**
   * Get source statistics (admin only)
   */
  async getSourceStats(): Promise<{
    total: number
    byType: Record<string, number>
  }> {
    return this.apiClient.get<{
      total: number
      byType: Record<string, number>
    }>('/admin/sources/stats')
  }

  /**
   * Get all articles (admin only)
   */
  async getAllArticles(params: {
    offset?: number
    limit?: number
    search?: string
    sortField?: 'createdAt' | 'updatedAt' | 'publishedAt'
    sortOrder?: 'asc' | 'desc'
  }): Promise<GetComplaintsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString())
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.sortField) queryParams.append('sortField', params.sortField)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    const url = query ? `/admin/articles?${query}` : '/admin/articles'
    
    return this.apiClient.get<GetComplaintsResponse>(url)
  }
}


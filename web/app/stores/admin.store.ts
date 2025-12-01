/**
 * Admin Store
 * Manages admin-related state and operations
 */

import { AdminService, type Complaint, type ComplaintStatus, type ComplaintTargetType, type GetComplaintsParams } from '~/lib/api/admin.service'

export interface AdminFilters {
  status: ComplaintStatus | 'all'
  targetType: ComplaintTargetType | 'all'
  sortField: 'createdAt' | 'updatedAt' | 'status'
  sortOrder: 'asc' | 'desc'
}

export const useAdminStore = defineStore('admin', () => {
  // State
  const complaints = ref<Complaint[]>([])
  const complaintsTotal = ref(0)
  const complaintsLoading = ref(false)
  const complaintsError = ref<string | null>(null)
  
  const pagination = ref({
    offset: 0,
    limit: 20,
  })

  const filters = ref<AdminFilters>({
    status: 'all',
    targetType: 'all',
    sortField: 'createdAt',
    sortOrder: 'desc',
  })

  // Stats
  const totalComplaintsCount = ref(0)
  const pendingComplaintsCount = ref(0)
  const reviewedComplaintsCount = ref(0)
  const resolvedComplaintsCount = ref(0)
  const rejectedComplaintsCount = ref(0)

  // Admin service
  const adminService = computed(() => {
    const api = useApi()
    return new AdminService(api)
  })

  // Computed
  const currentPage = computed(() => Math.floor(pagination.value.offset / pagination.value.limit) + 1)
  const totalPages = computed(() => Math.ceil(complaintsTotal.value / pagination.value.limit))

  /**
   * Fetch complaints with current filters
   */
  async function fetchComplaints(resetPagination = false) {
    try {
      complaintsLoading.value = true
      complaintsError.value = null

      if (resetPagination) {
        pagination.value.offset = 0
      }

      const params: GetComplaintsParams = {
        offset: pagination.value.offset,
        limit: pagination.value.limit,
        sortField: filters.value.sortField,
        sortOrder: filters.value.sortOrder,
      }

      if (filters.value.status !== 'all') {
        params.status = filters.value.status
      }

      if (filters.value.targetType !== 'all') {
        params.targetType = filters.value.targetType
      }

      const response = await adminService.value.getComplaints(params)
      
      complaints.value = response.data
      complaintsTotal.value = response.total
    } catch (error) {
      complaintsError.value = error instanceof Error ? error.message : 'Failed to fetch complaints'
      console.error('Failed to fetch complaints:', error)
    } finally {
      complaintsLoading.value = false
    }
  }

  /**
   * Fetch complaint stats
   */
  async function fetchStats() {
    try {
      // Fetch all counts in parallel - get total from a single query without status filter
      const [all, pending, reviewed, resolved, rejected] = await Promise.all([
        adminService.value.getComplaints({ limit: 1 }), // Get total count without status filter
        adminService.value.getComplaints({ status: 'pending', limit: 1 }),
        adminService.value.getComplaints({ status: 'reviewed', limit: 1 }),
        adminService.value.getComplaints({ status: 'resolved', limit: 1 }),
        adminService.value.getComplaints({ status: 'rejected', limit: 1 }),
      ])

      totalComplaintsCount.value = all.total
      pendingComplaintsCount.value = pending.total
      reviewedComplaintsCount.value = reviewed.total
      resolvedComplaintsCount.value = resolved.total
      rejectedComplaintsCount.value = rejected.total
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  /**
   * Resolve a complaint
   */
  async function resolveComplaint(complaintId: string, resolutionNote?: string) {
    try {
      const updated = await adminService.value.resolveComplaint(complaintId, { resolutionNote })
      
      // Update in list
      const index = complaints.value.findIndex(c => c.id === complaintId)
      if (index !== -1) {
        complaints.value[index] = updated
      }

      // Update stats
      await fetchStats()

      return updated
    } catch (error) {
      throw error
    }
  }

  /**
   * Reject a complaint
   */
  async function rejectComplaint(complaintId: string, resolutionNote?: string) {
    try {
      const updated = await adminService.value.rejectComplaint(complaintId, { resolutionNote })
      
      // Update in list
      const index = complaints.value.findIndex(c => c.id === complaintId)
      if (index !== -1) {
        complaints.value[index] = updated
      }

      // Update stats
      await fetchStats()

      return updated
    } catch (error) {
      throw error
    }
  }

  /**
   * Mark complaint as reviewed
   */
  async function reviewComplaint(complaintId: string) {
    try {
      const updated = await adminService.value.reviewComplaint(complaintId)
      
      // Update in list
      const index = complaints.value.findIndex(c => c.id === complaintId)
      if (index !== -1) {
        complaints.value[index] = updated
      }

      // Update stats
      await fetchStats()

      return updated
    } catch (error) {
      throw error
    }
  }

  /**
   * Go to specific page
   */
  function goToPage(page: number) {
    pagination.value.offset = (page - 1) * pagination.value.limit
    fetchComplaints()
  }

  /**
   * Apply filters
   */
  function applyFilters(newFilters: Partial<AdminFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    fetchComplaints(true)
  }

  /**
   * Reset filters
   */
  function resetFilters() {
    filters.value = {
      status: 'all',
      targetType: 'all',
      sortField: 'createdAt',
      sortOrder: 'desc',
    }
    fetchComplaints(true)
  }

  return {
    // State
    complaints: readonly(complaints),
    complaintsTotal: readonly(complaintsTotal),
    complaintsLoading: readonly(complaintsLoading),
    complaintsError: readonly(complaintsError),
    pagination: readonly(pagination),
    filters,
    
    // Stats
    totalComplaintsCount: readonly(totalComplaintsCount),
    pendingComplaintsCount: readonly(pendingComplaintsCount),
    reviewedComplaintsCount: readonly(reviewedComplaintsCount),
    resolvedComplaintsCount: readonly(resolvedComplaintsCount),
    rejectedComplaintsCount: readonly(rejectedComplaintsCount),

    // Computed
    currentPage,
    totalPages,

    // Actions
    fetchComplaints,
    fetchStats,
    resolveComplaint,
    rejectComplaint,
    reviewComplaint,
    goToPage,
    applyFilters,
    resetFilters,
  }
})



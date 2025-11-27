<template>
  <Dialog :open="isOpen" @update:open="updateOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Report {{ targetType === 'source' ? 'Source' : 'Post' }}</DialogTitle>
        <DialogDescription>
          Help us keep the platform safe by reporting inappropriate content
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="reason">Reason for reporting</Label>
          <Select v-model="form.reason" required>
            <SelectTrigger id="reason">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">Spam</SelectItem>
              <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
              <SelectItem value="misinformation">Misinformation</SelectItem>
              <SelectItem value="copyright_violation">Copyright Violation</SelectItem>
              <SelectItem value="harassment">Harassment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="description">Additional details (optional)</Label>
          <textarea
            id="description"
            v-model="form.description"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Provide any additional information that might help us review this report..."
            :maxlength="5000"
            rows="4"
          />
          <p class="text-xs text-muted-foreground">
            {{ form.description?.length || 0 }}/5000 characters
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="updateOpen(false)" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button type="submit" :disabled="!form.reason || isSubmitting">
            <Icon v-if="isSubmitting" name="lucide:loader-2" class="h-4 w-4 mr-2 animate-spin" />
            {{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ComplaintTargetType, ComplaintReason } from '~/lib/api/complaints.service'
import { ComplaintsService } from '~/lib/api'
import { useApi } from '~/composables/useApi'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  targetType: ComplaintTargetType
  targetId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const api = useApi()
const complaintsService = new ComplaintsService(api)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const updateOpen = (value: boolean) => {
  isOpen.value = value
  if (!value) {
    // Reset form when dialog closes
    form.value = {
      reason: undefined,
      description: '',
    }
  }
}

const form = ref<{
  reason?: ComplaintReason
  description: string
}>({
  reason: undefined,
  description: '',
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!form.value.reason) {
    toast.error('Please select a reason for reporting')
    return
  }

  isSubmitting.value = true

  try {
    await complaintsService.createComplaint({
      targetType: props.targetType,
      targetId: props.targetId,
      reason: form.value.reason,
      description: form.value.description.trim() || undefined,
    })

    toast.success('Report submitted successfully. Thank you for helping keep the platform safe!')
    emit('submitted')
    updateOpen(false)
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Failed to submit report. Please try again.'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>


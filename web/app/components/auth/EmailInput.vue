<script setup lang="ts">
import { Input } from '@/components/ui/input'

interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'name@example.com',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const emailValidation = computed(() => {
  const email = props.modelValue || ''

  if (!email) return null

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValid = emailRegex.test(email)

  return {
    isValid,
    message: isValid ? 'Valid email address' : 'Please enter a valid email address',
  }
})
</script>

<template>
  <div class="space-y-2">
    <div class="relative">
      <Icon
        name="lucide:mail"
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      />
      <Input
        type="email"
        :placeholder="placeholder"
        :model-value="modelValue"
        :class="[
          'pl-9',
          emailValidation?.isValid
            ? 'pr-9 border-green-500 focus-visible:ring-green-500'
            : emailValidation?.isValid === false
              ? 'pr-9 border-red-500 focus-visible:ring-red-500'
              : '',
        ]"
        @update:model-value="(value) => emit('update:modelValue', String(value))"
      />

      <!-- Validation Status Icon -->
      <div v-if="emailValidation !== null" class="absolute right-3 top-1/2 -translate-y-1/2">
        <Icon
          v-if="emailValidation.isValid"
          name="lucide:check-circle-2"
          class="h-4 w-4 text-green-600"
        />
        <Icon v-else name="lucide:x-circle" class="h-4 w-4 text-red-600" />
      </div>
    </div>

    <!-- Validation Status Message -->
    <div v-if="emailValidation !== null" class="flex items-center gap-2 text-xs">
      <Icon
        v-if="emailValidation.isValid"
        name="lucide:check-circle-2"
        class="h-3.5 w-3.5 text-green-600"
      />
      <Icon v-else name="lucide:alert-circle" class="h-3.5 w-3.5 text-red-600" />
      <span :class="emailValidation.isValid ? 'text-green-600' : 'text-red-600'">
        {{ emailValidation.message }}
      </span>
    </div>
  </div>
</template>

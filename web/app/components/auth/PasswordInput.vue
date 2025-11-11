<script setup lang="ts">
import { Input } from '@/components/ui/input'

interface Props {
  modelValue?: string
  placeholder?: string
  icon?: string
  showValidation?: boolean
  isValid?: boolean | null
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Enter password',
  icon: 'lucide:lock',
  showValidation: false,
  isValid: null,
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const inputClasses = computed(() => {
  const classes = ['pl-9']

  if (props.showValidation && props.isValid !== null) {
    classes.push('pr-20')
    if (props.isValid) {
      classes.push('border-green-500 focus-visible:ring-green-500')
    } else {
      classes.push('border-red-500 focus-visible:ring-red-500')
    }
  } else {
    classes.push('pr-9')
  }

  return classes
})
</script>

<template>
  <div class="relative">
    <Icon
      :name="icon"
      class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
    />
    <Input
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :model-value="modelValue"
      :class="inputClasses"
      @update:model-value="(value) => emit('update:modelValue', String(value))"
    />

    <!-- Validation Icon -->
    <div
      v-if="showValidation && isValid !== null"
      class="absolute right-10 top-1/2 -translate-y-1/2"
    >
      <Icon v-if="isValid" name="lucide:check-circle-2" class="h-4 w-4 text-green-600" />
      <Icon v-else name="lucide:x-circle" class="h-4 w-4 text-red-600" />
    </div>

    <!-- Toggle Visibility Button -->
    <button
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="showPassword = !showPassword"
    >
      <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
    </button>
  </div>
</template>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <Button variant="ghost" size="sm" class="mb-4" @click="navigateTo('/sources')">
        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
        Back to Sources
      </Button>
      <h1 class="text-3xl font-bold text-foreground">Add Source</h1>
      <p class="text-muted-foreground mt-1">
        Add Telegram channels or Instagram accounts to your feed
      </p>
    </div>

    <!-- Source Type Selection -->
    <Card>
      <CardHeader>
        <CardTitle>Source Type</CardTitle>
        <CardDescription>Select the type of source you want to add</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs v-model="selectedType" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
          <TabsContent value="telegram" class="mt-4">
            <div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <Icon name="lucide:send" class="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p class="font-medium text-foreground">Telegram Channel</p>
                <p class="text-sm text-muted-foreground">
                  Add a Telegram channel or group to get updates in your feed.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="instagram" class="mt-4">
            <div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <Icon name="lucide:instagram" class="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p class="font-medium text-foreground">Instagram Account</p>
                <p class="text-sm text-muted-foreground">
                  Follow an Instagram account to see their posts in your feed.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- Add Source Form -->
    <Card>
      <CardHeader>
        <CardTitle>Source Details</CardTitle>
        <CardDescription>Enter the URL or username for your source</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <Label for="url" class="text-foreground">URL</Label>
          <Input
            id="url"
            v-model="formData.url"
            :placeholder="
              selectedType === 'instagram'
                ? 'Instagram username (e.g., @username)'
                : 'Telegram channel username (e.g., @channelname)'
            "
            class="mt-1"
            @blur="validateUrl"
          />
          <p v-if="urlError" class="text-sm text-destructive mt-1">{{ urlError }}</p>
        </div>

        <div>
          <Label for="name" class="text-foreground">Name (Optional)</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Leave empty to auto-detect"
            class="mt-1"
          />
          <p class="text-sm text-muted-foreground mt-1">
            A custom name for this source. If left empty, we'll try to detect it automatically.
          </p>
        </div>

        <!-- Validation Status -->
        <Alert v-if="validationStatus" :variant="validationStatus.type">
          <Icon :name="validationStatus.icon" class="h-4 w-4" />
          <AlertTitle>{{ validationStatus.title }}</AlertTitle>
          <AlertDescription>{{ validationStatus.message }}</AlertDescription>
        </Alert>

        <!-- Source Preview -->
        <div v-if="sourcePreview" class="p-4 bg-card rounded-lg border border-border space-y-2">
          <p class="font-medium text-foreground">Preview:</p>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-primary/10">
              <Icon :name="previewIcon" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="font-medium text-foreground">{{ sourcePreview.name }}</p>
              <p class="text-sm text-muted-foreground">{{ sourcePreview.url }}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex justify-end gap-2">
        <Button variant="outline" @click="navigateTo('/sources')"> Cancel </Button>
        <Button variant="outline" :disabled="!formData.url || isValidating" @click="handleValidate">
          <Icon
            name="lucide:check-circle"
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': isValidating }"
          />
          Validate
        </Button>
        <Button :disabled="!isValid || isSubmitting" @click="handleSubmit">
          <Icon
            name="lucide:plus-circle"
            class="mr-2 h-4 w-4"
            :class="{ 'animate-spin': isSubmitting }"
          />
          {{ isSubmitting ? 'Adding...' : 'Add Source' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

definePageMeta({
  layout: 'default',
})

const selectedType = ref<'telegram' | 'instagram'>('telegram')
const formData = ref({
  url: '',
  name: '',
})
const urlError = ref('')
const isValid = ref(false)
const isValidating = ref(false)
const isSubmitting = ref(false)
interface SourcePreview {
  name: string
  url: string
}

const sourcePreview = ref<SourcePreview | null>(null)
const validationStatus = ref<{
  type: 'default' | 'destructive' | 'success'
  icon: string
  title: string
  message: string
} | null>(null)

const previewIcon = computed(() => {
  return selectedType.value === 'instagram' ? 'lucide:instagram' : 'lucide:send'
})

const validateUrl = () => {
  urlError.value = ''
  if (!formData.value.url) {
    return
  }

  if (selectedType.value === 'instagram') {
    // Instagram username validation
    const instagramPattern = /^@?[a-zA-Z0-9._]+$/
    if (!instagramPattern.test(formData.value.url.replace('@', ''))) {
      urlError.value = 'Please enter a valid Instagram username'
    }
  } else {
    // Telegram channel validation
    const telegramPattern = /^@?[a-zA-Z0-9_]+$/
    if (!telegramPattern.test(formData.value.url.replace('@', ''))) {
      urlError.value = 'Please enter a valid Telegram channel username'
    }
  }
}

const handleValidate = async () => {
  if (!formData.value.url || urlError.value) {
    return
  }

  isValidating.value = true
  validationStatus.value = null

  try {
    // TODO: Call validation API
    // const response = await validateSource({
    //   url: formData.value.url,
    //   source: selectedType.value,
    // })

    // Mock validation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    sourcePreview.value = {
      name: formData.value.name || 'Example Source',
      url: formData.value.url,
    }

    validationStatus.value = {
      type: 'success',
      icon: 'lucide:check-circle',
      title: 'Source Valid',
      message: 'This source looks good! You can add it now.',
    }

    isValid.value = true
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Could not validate this source. Please check the URL and try again.'
    validationStatus.value = {
      type: 'destructive',
      icon: 'lucide:alert-circle',
      title: 'Validation Failed',
      message: errorMessage,
    }
    isValid.value = false
  } finally {
    isValidating.value = false
  }
}

const handleSubmit = async () => {
  if (!isValid.value) {
    await handleValidate()
    return
  }

  isSubmitting.value = true

  try {
    // TODO: Call add source API
    // await addSource({
    //   url: formData.value.url,
    //   name: formData.value.name || sourcePreview.value?.name,
    //   source: selectedType.value,
    // })

    // Mock submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show success and redirect
    navigateTo('/sources')
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Could not add this source. Please try again.'
    validationStatus.value = {
      type: 'destructive',
      icon: 'lucide:alert-circle',
      title: 'Failed to Add Source',
      message: errorMessage,
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

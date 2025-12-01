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
        Add Telegram channels, Instagram accounts, Twitter/X profiles, or RSS feeds to your feed
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
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="twitter">Twitter/X</TabsTrigger>
            <TabsTrigger value="rss">RSS Feed</TabsTrigger>
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
          <TabsContent value="twitter" class="mt-4">
            <div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <Icon name="lucide:twitter" class="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p class="font-medium text-foreground">Twitter/X Account</p>
                <p class="text-sm text-muted-foreground">
                  Follow a Twitter/X account to see their tweets in your feed.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="rss" class="mt-4">
            <div class="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
              <Icon name="lucide:rss" class="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p class="font-medium text-foreground">RSS / Atom Feed</p>
                <p class="text-sm text-muted-foreground">
                  Add any RSS or Atom feed to get articles in your feed.
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
            :placeholder="urlPlaceholder"
            class="mt-1"
            @blur="validateUrl"
          />
          <p v-if="urlError" class="text-sm text-destructive mt-1">{{ urlError }}</p>
          <p v-if="selectedType === 'rss'" class="text-sm text-muted-foreground mt-1">
            Common patterns: /feed, /rss, /atom, .xml
          </p>
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
        <Button :disabled="!formData.url || isSubmitting" @click="handleSubmit">
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
import { useApi } from '~/composables/useApi'
import { SourcesService } from '~/lib/api'
import { buildSourceUrl, isValidUrl, type SourceType } from '~/utils/source-url'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const sourcesService = new SourcesService(api)

const selectedType = ref<SourceType>('telegram')
const formData = ref({
  url: '',
  name: '',
})
const urlError = ref('')
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
  if (selectedType.value === 'instagram') return 'lucide:instagram'
  if (selectedType.value === 'twitter') return 'lucide:twitter'
  if (selectedType.value === 'rss') return 'lucide:rss'
  return 'lucide:send'
})

const urlPlaceholder = computed(() => {
  switch (selectedType.value) {
    case 'instagram':
      return 'Instagram username (e.g., @username)'
    case 'twitter':
      return 'Twitter/X username (e.g., @username)'
    case 'rss':
      return 'RSS feed URL (e.g., https://example.com/feed)'
    default:
      return 'Telegram channel username (e.g., @channelname)'
  }
})

const validateUrl = () => {
  urlError.value = ''
  if (!formData.value.url) {
    return
  }

  // Basic validation - allow both @handle and full URLs
  const trimmed = formData.value.url.trim()

  if (selectedType.value === 'instagram') {
    // Instagram username validation - allow @username or full URL
    const instagramPattern = /^@?[a-zA-Z0-9._]+$/
    const urlPattern = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/[a-zA-Z0-9._]+/

    if (!instagramPattern.test(trimmed.replace('@', '')) && !urlPattern.test(trimmed)) {
      urlError.value = 'Please enter a valid Instagram username (e.g., @username) or URL'
    }
  } else if (selectedType.value === 'twitter') {
    // Twitter/X username validation - allow @username or full URL
    const twitterPattern = /^@?[a-zA-Z0-9_]+$/
    const urlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/

    if (!twitterPattern.test(trimmed.replace('@', '')) && !urlPattern.test(trimmed)) {
      urlError.value = 'Please enter a valid Twitter/X username (e.g., @username) or URL'
    }
  } else if (selectedType.value === 'rss') {
    // RSS feed validation - must be a valid URL
    // Try to parse as URL (with or without protocol)
    let urlToCheck = trimmed
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = `https://${urlToCheck}`
    }

    if (!isValidUrl(urlToCheck)) {
      urlError.value = 'Please enter a valid RSS feed URL (e.g., https://example.com/feed)'
    }
  } else {
    // Telegram channel validation - allow @channelname or full URL
    const telegramPattern = /^@?[a-zA-Z0-9_]+$/
    const urlPattern = /^https?:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]+/

    if (!telegramPattern.test(trimmed.replace('@', '')) && !urlPattern.test(trimmed)) {
      urlError.value = 'Please enter a valid Telegram channel username (e.g., @channelname) or URL'
    }
  }
}

const handleSubmit = async () => {
  if (!formData.value.url || urlError.value) {
    return
  }

  isSubmitting.value = true
  validationStatus.value = null

  try {
    // Build the full URL from input (@handle or full URL)
    const fullUrl = buildSourceUrl(formData.value.url, selectedType.value)

    // Step 1: Validate the source first
    let validationResponse
    try {
      validationResponse = await sourcesService.validateSource(fullUrl)

      // Show preview
      sourcePreview.value = {
        name: formData.value.name || validationResponse.name,
        url: validationResponse.url,
      }

      validationStatus.value = {
        type: 'success',
        icon: 'lucide:check-circle',
        title: 'Source Valid',
        message: 'Adding source to your feed...',
      }
    } catch (validationError: unknown) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : 'Could not validate this source. Please check the URL and try again.'
      validationStatus.value = {
        type: 'destructive',
        icon: 'lucide:alert-circle',
        title: 'Validation Failed',
        message: errorMessage,
      }
      toast.error('Validation Failed', {
        description: errorMessage,
      })
      return
    }

    // Step 2: Add the source
    await sourcesService.addSource(fullUrl)

    toast.success('Source Added', {
      description: 'The source has been successfully added to your feed.',
    })

    // Redirect to sources page
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
    toast.error('Failed to Add Source', {
      description: errorMessage,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

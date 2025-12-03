<template>
  <footer
    class="border-t border-border/50 bg-background/90 dark:bg-background/95 backdrop-blur-xl backdrop-saturate-150 shadow-sm mt-auto before:absolute before:inset-0 before:bg-linear-to-t before:from-background/40 before:to-transparent before:pointer-events-none relative"
  >
    <div class="relative container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:newspaper" class="h-6 w-6 text-primary" />
            <span class="font-bold text-xl text-foreground">News App</span>
          </div>
          <p class="text-sm text-muted-foreground max-w-md mb-4">
            Your personalized news aggregator and editor. Stay updated with articles from RSS feeds,
            Instagram, and Twitter all in one place. Edit articles, add sources, and share them with
            your friends.
          </p>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com/sokolovgit/news-app"
              target="_blank"
              rel="noopener noreferrer"
              class="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub Repository"
            >
              <Icon name="lucide:github" class="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/sokolov-oleksandr/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Icon name="lucide:linkedin" class="h-5 w-5" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-foreground mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/articles/public"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Public Articles
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                v-if="authStore.isAuthenticated"
                to="/articles"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Articles
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                v-if="authStore.isAuthenticated"
                to="/feed"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Feed
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                v-if="authStore.isAuthenticated"
                to="/sources"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sources
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h3 class="font-semibold text-foreground mb-4">Account</h3>
          <ul class="space-y-2">
            <li v-if="!authStore.isAuthenticated">
              <NuxtLink
                to="/login"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </NuxtLink>
            </li>
            <li v-if="!authStore.isAuthenticated">
              <NuxtLink
                to="/register"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sign Up
              </NuxtLink>
            </li>
            <li v-if="authStore.isAuthenticated">
              <NuxtLink
                to="/profile"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Profile
              </NuxtLink>
            </li>
            <li v-if="authStore.isAuthenticated">
              <NuxtLink
                to="/sources/add"
                class="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Add Source
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-8 pt-8 border-t border-border">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-muted-foreground text-center md:text-left">
            © {{ currentYear }} News App. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <!-- Theme Switcher -->
            <button
              type="button"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              :aria-label="themeLabel"
              @click="toggleTheme"
            >
              <Icon :name="themeIcon" class="h-4 w-4" />
              <span class="hidden sm:inline">{{ themeLabel }}</span>
            </button>
            <div class="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useColorMode } from '#imports'

const authStore = useAuthStore()
const colorMode = useColorMode()
const currentYear = new Date().getFullYear()

const themeIcon = computed(() => {
  return colorMode.preference === 'dark' ? 'lucide:sun' : 'lucide:moon'
})

const themeLabel = computed(() => {
  return colorMode.preference === 'dark' ? 'Light Mode' : 'Dark Mode'
})

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}
</script>

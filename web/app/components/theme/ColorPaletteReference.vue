<!-- Color Palette Reference -->
<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <header class="flex items-center justify-between pb-6 border-b-2 border-border">
        <h1 class="text-4xl font-bold">News App - Color System</h1>
        <ThemeSwitcher />
      </header>

      <!-- Core Colors -->
      <section class="space-y-6">
        <h2 class="text-3xl font-semibold">Core Colors (4)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-background border-2 border-border shadow-lg" />
            <div>
              <h3 class="font-semibold">Background</h3>
              <code class="text-sm text-primary">bg-background</code>
              <p class="text-sm text-muted-foreground mt-1">Main background</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-card shadow-lg" />
            <div>
              <h3 class="font-semibold">Card/Surface</h3>
              <code class="text-sm text-primary">bg-card</code>
              <p class="text-sm text-muted-foreground mt-1">Cards & panels</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-primary shadow-lg flex items-center justify-center">
              <span class="text-primary-foreground font-semibold">Primary</span>
            </div>
            <div>
              <h3 class="font-semibold">Primary</h3>
              <code class="text-sm text-primary">bg-primary</code>
              <p class="text-sm text-muted-foreground mt-1">Interactive elements</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-foreground shadow-lg flex items-center justify-center">
              <span class="text-background font-semibold">Foreground</span>
            </div>
            <div>
              <h3 class="font-semibold">Foreground</h3>
              <code class="text-sm text-primary">text-foreground</code>
              <p class="text-sm text-muted-foreground mt-1">Primary text</p>
            </div>
          </div>
        </div>
      </section>

      <!-- UI Element Colors -->
      <section class="space-y-6">
        <h2 class="text-3xl font-semibold">UI Element Colors (2)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-card border-4 border-border shadow-lg" />
            <div>
              <h3 class="font-semibold">Border</h3>
              <code class="text-sm text-primary">border-border</code>
              <p class="text-sm text-muted-foreground mt-1">Dividers & outlines</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-card shadow-lg flex items-center justify-center">
              <span class="text-muted-foreground font-semibold text-2xl">Muted</span>
            </div>
            <div>
              <h3 class="font-semibold">Muted</h3>
              <code class="text-sm text-primary">text-muted-foreground</code>
              <p class="text-sm text-muted-foreground mt-1">Secondary text</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Status Colors -->
      <section class="space-y-6">
        <h2 class="text-3xl font-semibold">Status Colors (4)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-success shadow-lg flex items-center justify-center">
              <span class="text-success-foreground font-semibold">Success</span>
            </div>
            <div>
              <h3 class="font-semibold">Success</h3>
              <code class="text-sm text-primary">bg-success</code>
              <p class="text-sm text-muted-foreground mt-1">Positive actions</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-warning shadow-lg flex items-center justify-center">
              <span class="text-warning-foreground font-semibold">Warning</span>
            </div>
            <div>
              <h3 class="font-semibold">Warning</h3>
              <code class="text-sm text-primary">bg-warning</code>
              <p class="text-sm text-muted-foreground mt-1">Caution states</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-error shadow-lg flex items-center justify-center">
              <span class="text-error-foreground font-semibold">Error</span>
            </div>
            <div>
              <h3 class="font-semibold">Error</h3>
              <code class="text-sm text-primary">bg-error</code>
              <p class="text-sm text-muted-foreground mt-1">Destructive actions</p>
            </div>
          </div>

          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-info shadow-lg flex items-center justify-center">
              <span class="text-info-foreground font-semibold">Info</span>
            </div>
            <div>
              <h3 class="font-semibold">Info</h3>
              <code class="text-sm text-primary">bg-info</code>
              <p class="text-sm text-muted-foreground mt-1">Informational</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Component Examples -->
      <section class="space-y-6">
        <h2 class="text-3xl font-semibold">Component Examples</h2>

        <!-- Buttons -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Buttons</h3>
          <div class="flex flex-wrap gap-3">
            <button
              class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Primary
            </button>
            <button
              class="px-6 py-3 bg-success text-success-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Success
            </button>
            <button
              class="px-6 py-3 bg-warning text-warning-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Warning
            </button>
            <button
              class="px-6 py-3 bg-error text-error-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Error
            </button>
            <button
              class="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Secondary
            </button>
            <button
              class="px-6 py-3 border-2 border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Outline
            </button>
          </div>
        </div>

        <!-- Alerts/Notifications -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Alerts</h3>
          <div class="space-y-3">
            <div class="p-4 bg-success/10 border-l-4 border-success rounded-lg">
              <p class="text-success font-semibold">Success!</p>
              <p class="text-muted-foreground">Your changes have been saved successfully.</p>
            </div>
            <div class="p-4 bg-warning/10 border-l-4 border-warning rounded-lg">
              <p class="text-warning font-semibold">Warning</p>
              <p class="text-muted-foreground">Please review your information before submitting.</p>
            </div>
            <div class="p-4 bg-error/10 border-l-4 border-error rounded-lg">
              <p class="text-error font-semibold">Error</p>
              <p class="text-muted-foreground">An error occurred while processing your request.</p>
            </div>
            <div class="p-4 bg-info/10 border-l-4 border-info rounded-lg">
              <p class="text-info font-semibold">Info</p>
              <p class="text-muted-foreground">New updates are available for your application.</p>
            </div>
          </div>
        </div>

        <!-- Form Elements -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Form Elements</h3>
          <div class="max-w-md space-y-4">
            <div>
              <label class="block text-foreground font-medium mb-2">Normal Input</label>
              <input
                type="text"
                placeholder="Enter text..."
                class="w-full px-4 py-2 bg-card border-2 border-border focus:border-primary focus:outline-none rounded-lg text-foreground placeholder:text-muted-foreground transition-colors"
              />
            </div>
            <div>
              <label class="block text-success font-medium mb-2">Success Input</label>
              <input
                type="text"
                value="Valid input"
                class="w-full px-4 py-2 bg-card border-2 border-success focus:border-success focus:outline-none rounded-lg text-foreground"
              />
              <p class="text-success text-sm mt-1">Looks good!</p>
            </div>
            <div>
              <label class="block text-error font-medium mb-2">Error Input</label>
              <input
                type="text"
                value="Invalid input"
                class="w-full px-4 py-2 bg-card border-2 border-error focus:border-error focus:outline-none rounded-lg text-foreground"
              />
              <p class="text-error text-sm mt-1">This field is required.</p>
            </div>
          </div>
        </div>

        <!-- Cards -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Cards</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 bg-card rounded-lg shadow-lg border border-border">
              <h4 class="text-lg font-semibold text-card-foreground mb-2">Default Card</h4>
              <p class="text-muted-foreground mb-4">A standard card with border.</p>
              <button
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Action
              </button>
            </div>

            <div class="p-6 bg-card rounded-lg shadow-lg border-2 border-primary">
              <h4 class="text-lg font-semibold text-card-foreground mb-2">Highlighted Card</h4>
              <p class="text-muted-foreground mb-4">Featured with primary border.</p>
              <button
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Action
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Color Reference -->
      <section class="space-y-6">
        <h2 class="text-3xl font-semibold">Complete Reference</h2>
        <div class="p-6 bg-card rounded-lg border border-border">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-card-foreground mb-3">Core Colors</h4>
              <ul class="space-y-1 text-sm">
                <li><code class="text-primary">bg-background</code> - Background</li>
                <li><code class="text-primary">bg-card</code> - Cards/Panels</li>
                <li><code class="text-primary">bg-primary</code> - Interactive</li>
                <li><code class="text-primary">text-foreground</code> - Text</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-card-foreground mb-3">UI Elements</h4>
              <ul class="space-y-1 text-sm">
                <li><code class="text-primary">border-border</code> - Borders</li>
                <li><code class="text-primary">text-muted-foreground</code> - Secondary text</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-card-foreground mb-3">Status Colors</h4>
              <ul class="space-y-1 text-sm">
                <li><code class="text-primary">bg-success</code> - Success</li>
                <li><code class="text-primary">bg-warning</code> - Warning</li>
                <li><code class="text-primary">bg-error</code> - Error</li>
                <li><code class="text-primary">bg-info</code> - Info</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-card-foreground mb-3">Best Practices</h4>
              <ul class="space-y-1 text-sm text-muted-foreground">
                <li>• Use semantic color tokens</li>
                <li>• Status colors for feedback</li>
                <li>• Border for subtle dividers</li>
                <li>• Muted-foreground for secondary info</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
    <NuxtRouteAnnouncer />
  </div>
</template>

<script setup lang="ts"></script>

<!-- Color Palette Reference -->
<template>
  <div class="min-h-screen bg-background p-8">
    <div class="max-w-6xl mx-auto space-y-12">
      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold text-foreground mb-2">Color Palette Reference</h1>
        <p class="text-muted-foreground">Brand colors and semantic tokens for the News App</p>
      </div>

      <!-- Brand Colors -->
      <section class="space-y-6">
        <h2 class="text-2xl font-semibold text-foreground">Brand Colors</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Black -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-brand-black border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Black</h3>
              <p class="text-sm text-muted-foreground font-mono">#000807</p>
              <p class="text-sm text-muted-foreground font-mono">HSL: 173 100% 2%</p>
              <p class="text-xs text-muted-foreground mt-1">Dark backgrounds, primary text</p>
            </div>
          </div>

          <!-- Cool Gray -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-brand-cool-gray border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Cool Gray</h3>
              <p class="text-sm text-muted-foreground font-mono">#a2a3bb</p>
              <p class="text-sm text-muted-foreground font-mono">HSL: 238 16% 68%</p>
              <p class="text-xs text-muted-foreground mt-1">Muted elements, disabled states</p>
            </div>
          </div>

          <!-- Tropical Indigo -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-brand-tropical-indigo border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Tropical Indigo</h3>
              <p class="text-sm text-muted-foreground font-mono">#9395d3</p>
              <p class="text-sm text-muted-foreground font-mono">HSL: 238 42% 70%</p>
              <p class="text-xs text-muted-foreground mt-1">Primary actions, links, highlights</p>
            </div>
          </div>

          <!-- Periwinkle -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-brand-periwinkle border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Periwinkle</h3>
              <p class="text-sm text-muted-foreground font-mono">#b3b7ee</p>
              <p class="text-sm text-muted-foreground font-mono">HSL: 236 63% 82%</p>
              <p class="text-xs text-muted-foreground mt-1">Secondary actions, accents</p>
            </div>
          </div>

          <!-- Ghost White -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-brand-ghost-white border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Ghost White</h3>
              <p class="text-sm text-muted-foreground font-mono">#fbf9ff</p>
              <p class="text-sm text-muted-foreground font-mono">HSL: 260 100% 99%</p>
              <p class="text-xs text-muted-foreground mt-1">Light backgrounds, cards, panels</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Semantic Colors -->
      <section class="space-y-6">
        <h2 class="text-2xl font-semibold text-foreground">Semantic Colors</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Background -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-background border-2 border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Background</h3>
              <code class="text-sm text-muted-foreground">bg-background</code>
            </div>
          </div>

          <!-- Foreground -->
          <div class="space-y-2">
            <div class="h-32 rounded-lg bg-foreground border border-border shadow-md" />
            <div>
              <h3 class="font-semibold text-foreground">Foreground</h3>
              <code class="text-sm text-muted-foreground">text-foreground</code>
            </div>
          </div>

          <!-- Primary -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-primary border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-primary-foreground font-semibold">Primary</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Primary</h3>
              <code class="text-sm text-muted-foreground">bg-primary</code>
            </div>
          </div>

          <!-- Secondary -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-secondary border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-secondary-foreground font-semibold">Secondary</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Secondary</h3>
              <code class="text-sm text-muted-foreground">bg-secondary</code>
            </div>
          </div>

          <!-- Muted -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-muted border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-muted-foreground font-semibold">Muted</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Muted</h3>
              <code class="text-sm text-muted-foreground">bg-muted</code>
            </div>
          </div>

          <!-- Accent -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-accent border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-accent-foreground font-semibold">Accent</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Accent</h3>
              <code class="text-sm text-muted-foreground">bg-accent</code>
            </div>
          </div>

          <!-- Card -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-card border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-card-foreground font-semibold">Card</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Card</h3>
              <code class="text-sm text-muted-foreground">bg-card</code>
            </div>
          </div>

          <!-- Destructive -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-destructive border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-destructive-foreground font-semibold">Destructive</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Destructive</h3>
              <code class="text-sm text-muted-foreground">bg-destructive</code>
            </div>
          </div>

          <!-- Success -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-success border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-success-foreground font-semibold">Success</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Success</h3>
              <code class="text-sm text-muted-foreground">bg-success</code>
            </div>
          </div>

          <!-- Warning -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-warning border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-warning-foreground font-semibold">Warning</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Warning</h3>
              <code class="text-sm text-muted-foreground">bg-warning</code>
            </div>
          </div>

          <!-- Info -->
          <div class="space-y-2">
            <div
              class="h-32 rounded-lg bg-info border border-border shadow-md flex items-center justify-center"
            >
              <span class="text-info-foreground font-semibold">Info</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground">Info</h3>
              <code class="text-sm text-muted-foreground">bg-info</code>
            </div>
          </div>
        </div>
      </section>

      <!-- UI Elements -->
      <section class="space-y-6">
        <h2 class="text-2xl font-semibold text-foreground">UI Elements</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Borders -->
          <div class="space-y-4">
            <h3 class="font-semibold text-foreground">Borders</h3>
            <div class="space-y-2">
              <div class="p-4 border-2 border-border rounded-lg">
                <code class="text-sm">border-border</code>
              </div>
              <div class="p-4 border-2 border-input rounded-lg">
                <code class="text-sm">border-input</code>
              </div>
            </div>
          </div>

          <!-- Rings -->
          <div class="space-y-4">
            <h3 class="font-semibold text-foreground">Focus Rings</h3>
            <div class="space-y-2">
              <button class="p-4 border border-border rounded-lg focus-ring">
                <code class="text-sm">focus-ring utility</code>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Usage Examples -->
      <section class="space-y-6">
        <h2 class="text-2xl font-semibold text-foreground">Usage Examples</h2>

        <div class="space-y-4">
          <!-- Button Examples -->
          <div class="space-y-2">
            <h3 class="font-semibold text-foreground">Buttons</h3>
            <div class="flex flex-wrap gap-2">
              <button
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
              >
                Primary
              </button>
              <button
                class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90"
              >
                Secondary
              </button>
              <button
                class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90"
              >
                Destructive
              </button>
              <button
                class="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-accent"
              >
                Outline
              </button>
            </div>
          </div>

          <!-- Card Example -->
          <div class="space-y-2">
            <h3 class="font-semibold text-foreground">Card</h3>
            <div
              class="p-6 bg-card text-card-foreground rounded-lg border border-border shadow-md max-w-md"
            >
              <h4 class="text-lg font-semibold mb-2">Card Title</h4>
              <p class="text-muted-foreground mb-4">
                This is an example card using the semantic color system.
              </p>
              <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Action
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a reference component - no logic needed
</script>

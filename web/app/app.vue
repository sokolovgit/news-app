<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header with theme switcher -->
      <header class="flex items-center justify-between pb-4 border-b border-border">
        <h1 class="text-3xl font-bold">News App</h1>
        <ThemeSwitcher />
      </header>

      <!-- Demo content -->
      <div class="space-y-6">
        <div class="rounded-lg border border-border bg-card p-6">
          <h2 class="text-2xl font-semibold text-card-foreground mb-4">
            Welcome to the themed app!
          </h2>
          <p class="text-muted-foreground mb-4">
            This app now supports light and dark themes. Use the theme switcher in the top right to
            toggle between them.
          </p>
          <div class="flex gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </div>

        <!-- Theme selector -->
        <div class="rounded-lg border border-border bg-card p-6">
          <h3 class="text-xl font-semibold text-card-foreground mb-4">Theme Options</h3>
          <ThemeToggle />
        </div>
      </div>

      <!-- Palette Reference -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h3 class="text-xl font-semibold text-card-foreground mb-4">Palette Reference</h3>
        <ColorPaletteReference />
      </div>

      <NuxtRouteAnnouncer />
    </div>
  </div>
</template>

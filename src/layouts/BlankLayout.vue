<script setup lang="ts">
import { RouterView } from 'vue-router'

// A chromeless, centered shell for full-screen pages (404, future auth screens).
</script>

<template>
  <main class="blank">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped lang="scss" src="@/styles/layouts/BlankLayout.scss"></style>

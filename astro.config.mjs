import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";

// --- ADD THIS LINE ---
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: 'server',

  // --- ADD THIS LINE ---
  adapter: vercel(),

  integrations: [
    tailwind(),
    icon()
  ]
});
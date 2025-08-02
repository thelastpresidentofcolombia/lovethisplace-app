import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless"; // This line was missing

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(), // This line was missing
  integrations: [
    tailwind(),
    icon()
  ]
});
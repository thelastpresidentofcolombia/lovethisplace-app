import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [
    // The 'applyBaseStyles: false' option has been removed.
    // This was the cause of the error.
    tailwind(),
    icon()
  ]
});
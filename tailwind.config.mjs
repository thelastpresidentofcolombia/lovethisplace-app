/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                sand: '#FFF8F4',
                coral: '#FF6F61',
                mint: '#12D3CF',
                ink: '#403532',
                'dark-bg': '#1a1a1a',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Clash Display', 'sans-serif'],
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
            },
        },
    },
    plugins: [],
};
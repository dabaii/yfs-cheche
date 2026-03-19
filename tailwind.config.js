/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                'brutal': '6px 6px 0px 0px rgba(0,0,0,1)',
                'brutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
                'brutal-xl': '12px 12px 0px 0px rgba(0,0,0,1)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}
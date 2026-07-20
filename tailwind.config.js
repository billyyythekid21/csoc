/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#00DC82',
					dark: '#00b368',
				}
			},
			fontFamily: {
				dm: ['DM Sans', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
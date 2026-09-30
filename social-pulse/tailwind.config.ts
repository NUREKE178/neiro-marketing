import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D9FF3F",
        black: "#111111",
        white: "#FFFFFF",
        purple: "#A78BFA",
        pink: "#FF75B5",
        blue: "#76D7FF",
        background: "#F5F4EF",
        brut: {
          yellow: "#D9FF3F",
          black: "#111111",
          purple: "#A78BFA",
          pink: "#FF75B5",
          blue: "#76D7FF",
          bg: "#F5F4EF"
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'brut': '6px 6px 0px 0px #111111',
        'brut-sm': '4px 4px 0px 0px #111111',
        'brut-lg': '8px 8px 0px 0px #111111',
        'brut-hover': '8px 8px 0px 0px #111111',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      }
    },
  },
  plugins: [],
};
export default config;

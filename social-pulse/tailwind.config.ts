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
        primary: "#DFFF00",
        neon: "#C4F82A",
        black: "#000000",
        white: "#FFFFFF",
        purple: "#A58BFF",
        pink: "#FF85A1",
        blue: "#70D6FF",
        background: "#F9F9FB",
        brut: {
          yellow: "#DFFF00",
          neon: "#C4F82A",
          black: "#000000",
          purple: "#A58BFF",
          pink: "#FF85A1",
          blue: "#70D6FF",
          bg: "#F9F9FB"
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'brut': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brut-sm': '3px 3px 0px 0px rgba(0,0,0,1)',
        'brut-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'brut-xl': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      borderRadius: {
        'brut': '8px',
      }
    },
  },
  plugins: [],
};
export default config;

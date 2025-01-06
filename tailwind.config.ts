import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        'xl': '1280px',
  			desktop: '1024px',
			tablet: '768px',
  			nm: '500px'
      },
    },
    extend: {
      screens: {
  			'xl': '1280px',
  			desktop: '1024px',
			tablet: '768px',
  			nm: '500px'
  		},
      colors: {
        N0: "#ffffff",
        N10: "#fbfbfb",
        N20: "#f7f7f7",
        N30: "#eeeeee",
        N40: "#e4e4e4",
        N50: "#cbcbcb",
        N60: "#bebebe",
        N70: "#b3b3b3",
        N80: "#a7a7a7",
        N90: "#9a9a9a",
        N100: "#8e8e8e",
        N200: "#818181",
        N300: "#747474",
        N400: "#6a6a6a",
        N500: "#5d5d5d",
        N600: "#535353",
        N700: "#444444",
        N800: "#383838",
        N900: "#2d2d2d",
        N910: "#292929",
        N920: "#202020",
        N930: "#191919",
        N940: "#131313",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        theme: {
          DEFAULT: "hsl(var(--theme))",
          foreground: "hsl(var(--theme-foreground))",
        },
        history: {
          DEFAULT: "hsl(var(--history))",
          foreground: "hsl(var(--history-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

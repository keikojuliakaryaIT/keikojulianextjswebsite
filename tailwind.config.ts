import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ungu: "#6675DF",
        toscadb: "#01C0C8",
        ungubt: "#AB8CE4",
        greenbt: "#00C292",
        bluebt: "#5B9BD1",
      },
    },
    height: {
      "10v": "10vh",
      "20v": "20vh",
      "30v": "30vh",
      "40v": "40vh",
      "50v": "50vh",
      "60v": "60vh",
      "70v": "70vh",
      "80v": "80vh",
      "90v": "90vh",
      "95v": "95vh",
      "100v": "100vh",
    },
    width: {
      "10v": "10vw",
      "20v": "20vw",
      "30v": "30vw",
      "40v": "40vw",
      "50v": "50vw",
      "60v": "60vw",
      "70v": "70vw",
      "80v": "80vw",
      "90v": "90vw",
      "95v": "95vw",
      "100v": "100vw",
      "full": "100%",
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
export default config;

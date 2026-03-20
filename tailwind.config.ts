import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { pretendard: ['Pretendard', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;

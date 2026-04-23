import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Otomatisasi mapping warna ke Muted Teal & Slate
        emerald: {
          50: "#f4f5f7",  // Soft Slate (Background luar)
          100: "#e9ecef", // Border tipis
          300: "#5ca4a9", // Soft Pine (Aksen hover/ring)
          400: "#3aafa9",
          500: "#2b7a78", // Muted Teal (Tombol utama)
          600: "#2b7a78", // Muted Teal (Override komponen lama)
          950: "#17252a", // Deep Slate (Teks judul tebal)
        },
        zinc: {
          50: "#f4f5f7",
          800: "#4b5d67", // Muted Gray (Teks sekunder)
          900: "#17252a", // Deep Slate
        }
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(23, 37, 42, 0.05)',
        'float': '0 20px 50px -20px rgba(23, 37, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
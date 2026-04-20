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
        // Kita "bajak" warna emerald agar menyesuaikan dengan palet baru
        emerald: {
          50: "#edffec",  // Honeydew (Paling terang untuk background panel)
          100: "#d1facf", // Turunan Honeydew untuk border tipis
          200: "#a3f4b0",
          300: "#61e786", // Light Green (Untuk aksen / ring focus)
          400: "#50c772",
          500: "#9792e3", // Soft Periwinkle (Untuk ikon aktif)
          600: "#5a5766", // Charcoal (Untuk tombol utama & elemen aktif)
          700: "#4d4a57",
          800: "#48435c", // Vintage Grape (Untuk teks sekunder)
          900: "#3d394e",
          950: "#2a2736", // Teks paling gelap
        },
        // Kita sesuaikan juga zinc agar seirama dengan Charcoal & Vintage Grape
        zinc: {
          50: "#edffec",  // Background aplikasi
          100: "#e5ece4",
          800: "#5a5766", // Charcoal (Teks utama)
          900: "#48435c", // Vintage Grape (Teks tebal/judul)
          950: "#2a2736",
        },
        pastel: {
          green: "#edffec", // Di-map ke Honeydew
          mint: "#61e786",  // Di-map ke Light Green
          cream: "#ffffff",
          surface: "#ffffff",
        }
      },
      boxShadow: {
        // Shadow disesuaikan warnanya agar menggunakan tone Vintage Grape / Charcoal
        'soft': '0 10px 40px -10px rgba(72, 67, 92, 0.1)',
        'float': '0 20px 50px -20px rgba(72, 67, 92, 0.15)',
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
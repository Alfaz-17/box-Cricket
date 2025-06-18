import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const themes = [
  // Light & Clean
  "light",
  "pastel",
  "lofi",
  "winter",
  "cupcake",
  "cmyk",

  // Dark & Bold
  "dark",
  "dracula",
  "synthwave",
  "black",
  "night",
  "luxury",

  // Fun & Playful
  "bumblebee",
  "valentine",
  "halloween",
  "fantasy",
  "aqua",

  // Nature Inspired
  "garden",
  "forest",
  "autumn",
  "emerald",

  // Futuristic & High Contrast
  "cyberpunk",
  "business",
  "acid",
  "dim",
  "coffee",
  "retro",
];

function SettingsPage() {
  const defaultTheme =
    document.documentElement.getAttribute("data-theme") || "forest";
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || defaultTheme
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.h1
        className="text-3xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎨 Choose Your Theme
      </motion.h1>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {themes.map((theme) => (
          <motion.div
            key={theme}
            className={`p-4 rounded-xl border border-base-300 cursor-pointer relative hover:scale-105 transition-transform duration-200 ${
              currentTheme === theme ? "ring-4 ring-primary" : ""
            }`}
            data-theme={theme}
            onClick={() => setCurrentTheme(theme)}
            whileHover={{ scale: 1.05 }}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold capitalize">{theme}</span>
              {currentTheme === theme && (
                <div className="badge badge-primary">Selected</div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              <div className="bg-primary h-4 rounded"></div>
              <div className="bg-secondary h-4 rounded"></div>
              <div className="bg-accent h-4 rounded"></div>
              <div className="bg-neutral h-4 rounded"></div>
              <div className="bg-base-200 h-4 rounded"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default SettingsPage;

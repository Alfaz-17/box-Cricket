import React, { useEffect, useState } from 'react';

const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'synthwave',
  'valentine',
  'halloween',
  'garden',
  'lofi',
  'pastel',
  'fantasy',
  'luxury',
  'dracula',
  'cmyk',
];

function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="max-w-md mx-auto p-4 bg-base-200 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">⚙️ UI Theme Settings</h1>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Choose Theme</span>
        </div>
        <select
          className="select select-bordered"
          value={currentTheme}
          onChange={(e) => setCurrentTheme(e.target.value)}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default SettingsPage;

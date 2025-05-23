// components/ui/Tabs.jsx
import React from "react";

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center border-b border-yellow-400 mb-6">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(tab.value)}
          className={`relative px-6 py-3 font-semibold transition-colors duration-300
            ${
              activeTab === tab.value
                ? "text-yellow-600 border-b-4 border-yellow-600"
                : "text-gray-600 hover:text-yellow-500"
            }
            focus:outline-none
          `}
          aria-selected={activeTab === tab.value}
          role="tab"
          tabIndex={activeTab === tab.value ? 0 : -1}
        >
          {tab.label}
          {/* Optional: a subtle underline animation */}
          <span
            className={`absolute bottom-0 left-0 w-full h-1 transition-all duration-300 ${
              activeTab === tab.value ? "bg-yellow-600" : "bg-transparent"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Tabs;

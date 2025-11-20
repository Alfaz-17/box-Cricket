// components/ui/Tabs.jsx
import React from 'react'

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center border-b border-primary mb-7">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(tab.value)}
          className={`relative px-3 py-3  font-semibold transition-colors duration-300
            ${activeTab === tab.value ? ' border-b-4 border-base-200' : ' hover:text-primary'}
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
              activeTab === tab.value ? 'bg-primary' : 'bg-transparent'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default Tabs

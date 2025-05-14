import React from 'react';

const variants = {
  primary: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  link: 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 underline bg-transparent'
};

const sizes = {
  sm: 'py-1 px-3 text-sm',
  md: 'py-2 px-4',
  lg: 'py-3 px-6 text-lg'
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        rounded-md shadow-sm transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
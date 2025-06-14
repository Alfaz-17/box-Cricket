import React from 'react';
import clsx from 'clsx'; // Optional: for cleaner conditional classes

const daisyVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-error',
  success: 'btn-success',
  link: 'btn-link text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300'
};

const daisySizes = {
  sm: 'btn-sm',
  md: '',         // DaisyUI default is medium
  lg: 'btn-lg'
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
      className={clsx(
        'btn transition-all duration-300 font-medium',
        daisyVariants[variant],
        daisySizes[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'btn-disabled opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
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

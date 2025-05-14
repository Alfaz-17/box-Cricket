import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`
          w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 
          rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 
          dark:text-white transition-colors duration-300
          ${error ? 'border-red-500 focus:ring-red-500' : 'focus:border-yellow-500'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
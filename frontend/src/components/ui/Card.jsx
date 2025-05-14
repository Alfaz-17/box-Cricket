import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '' 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
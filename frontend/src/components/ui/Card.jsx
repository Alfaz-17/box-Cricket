import React from "react";

const Card = ({ children, title, subtitle, footer, className = "" }) => {
  return (
    <div
      className={`card bg-base-300 shadow-md transition-colors duration-300 ${className}`}
    >
      {(title || subtitle) && (
        <div className="card-header border-b border-base-300 px-6 py-4">
          {title && (
            <h3 className="card-title text-lg font-semibold text-primary">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-base-content/70 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      <div className="card-body p-6">{children}</div>

      {footer && (
        <div className="card-footer border-t border-base-300 bg-base-200 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

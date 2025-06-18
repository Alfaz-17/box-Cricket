import React, { forwardRef } from "react";

const Input = forwardRef(
  ({ label, id, type = "text", error, className = "", ...props }, ref) => {
    return (
      <div className="form-control w-full mb-4">
        {label && (
          <label htmlFor={id} className="label">
            <span className="label-text text-primary">{label}</span>
          </label>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          className={`input input-bordered text-[16px] w-full
        ${error ? "input-error" : ""}
        ${className}
      `}
          {...props}
        />

        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

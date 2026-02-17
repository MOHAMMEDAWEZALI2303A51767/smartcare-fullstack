import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2 border rounded-lg transition-colors
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

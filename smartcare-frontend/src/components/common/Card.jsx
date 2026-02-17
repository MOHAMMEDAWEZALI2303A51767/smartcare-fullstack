import React from 'react';

const Card = ({ children, className = '', header, footer, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-100">
          {header}
        </div>
      )}
      <div className={`${noPadding ? '' : 'px-6 py-4'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

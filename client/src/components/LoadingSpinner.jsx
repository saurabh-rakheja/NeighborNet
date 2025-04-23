import React from 'react';

/**
 * Loading Spinner component for indicating loading states
 * @param {Object} props
 * @param {string} props.size - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} props.color - Color of the spinner: 'indigo', 'blue', 'green'
 * @param {string} props.message - Optional message to display under the spinner
 */
const LoadingSpinner = ({ size = 'md', color = 'indigo', message }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  };
  
  // Color classes
  const colorClasses = {
    indigo: 'border-indigo-200 border-t-indigo-600',
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {message && (
        <p className="mt-3 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  let sizeClasses = '';
  
  switch (size) {
    case 'sm':
      sizeClasses = 'h-4 w-4 border-2';
      break;
    case 'md':
      sizeClasses = 'h-8 w-8 border-3';
      break;
    case 'lg':
      sizeClasses = 'h-12 w-12 border-4';
      break;
    default:
      sizeClasses = 'h-8 w-8 border-3';
  }
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClasses} loading-spinner rounded-full border-slate-200 border-t-slate-600`}></div>
    </div>
  );
};

export default LoadingSpinner;
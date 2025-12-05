import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText,
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-fox-600 hover:bg-fox-500 text-white',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-gray-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white'
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        ${variantClasses[variant]}
        px-4 py-2 rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading ? (loadingText || 'جاري التحميل...') : children}
    </button>
  );
};

export default LoadingButton;

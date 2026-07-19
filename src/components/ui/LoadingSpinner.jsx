import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;
  return <Loader2 className={`${sizeClass} animate-spin text-indigo-500 ${className}`} />;
}
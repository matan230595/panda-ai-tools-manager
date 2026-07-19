import LoadingSpinner from './LoadingSpinner';

export default function SuspenseFallback({ height = 'h-64' }) {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <LoadingSpinner size="lg" />
    </div>
  );
}
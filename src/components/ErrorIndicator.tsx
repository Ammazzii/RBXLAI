import { ValidationError } from '@/utils/luaValidator';

interface ErrorIndicatorProps {
  errors: ValidationError[];
  className?: string;
}

const ErrorIndicator = ({ errors, className = '' }: ErrorIndicatorProps) => {
  if (errors.length === 0) return null;

  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {hasErrors && (
        <div className="flex items-center text-red-400">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">
            {errors.filter(e => e.severity === 'error').length}
          </span>
        </div>
      )}
      {hasWarnings && (
        <div className="flex items-center text-yellow-400">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">
            {errors.filter(e => e.severity === 'warning' || e.severity === 'info').length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ErrorIndicator;
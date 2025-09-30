import { useState, useEffect, useCallback } from 'react';
import { validateLuaCode, ValidationError, ValidationResult } from '@/utils/luaValidator';

export interface UseValidationResult {
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validateCode: (code: string) => void;
  getErrorsForLine: (lineNumber: number) => ValidationError[];
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
}

export function useLuaValidation(code: string, debounceMs: number = 500): UseValidationResult {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validateCode = useCallback((codeToValidate: string) => {
    setIsValidating(true);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      try {
        const result = validateLuaCode(codeToValidate);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation error:', error);
        // Set empty result on validation failure
        setValidationResult({
          isValid: false,
          errors: [{
            line: 1,
            column: 1,
            message: 'Validation failed',
            type: 'syntax',
            severity: 'error'
          }],
          warnings: []
        });
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceMs]);

  // Validate when code changes
  useEffect(() => {
    if (code && code.trim().length > 0) {
      validateCode(code);
    } else {
      // Clear validation result for empty code
      setValidationResult({
        isValid: true,
        errors: [],
        warnings: []
      });
      setIsValidating(false);
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [code, validateCode]);

  const getErrorsForLine = useCallback((lineNumber: number): ValidationError[] => {
    if (!validationResult) return [];
    return [...validationResult.errors, ...validationResult.warnings]
      .filter(error => error.line === lineNumber);
  }, [validationResult]);

  const hasErrors = validationResult ? validationResult.errors.length > 0 : false;
  const hasWarnings = validationResult ? validationResult.warnings.length > 0 : false;
  const errorCount = validationResult ? validationResult.errors.length : 0;
  const warningCount = validationResult ? validationResult.warnings.length : 0;

  return {
    validationResult,
    isValidating,
    validateCode,
    getErrorsForLine,
    hasErrors,
    hasWarnings,
    errorCount,
    warningCount
  };
}
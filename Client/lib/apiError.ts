import { ErrorContext } from '@better-fetch/fetch';

const ApiErrorFunc = (
  error: ErrorContext
): { statusText: string; message: string } => {
  const {
    status,
    statusText = '',
    message = 'An unexpected error occurred',
  } = error.error || {};

  switch (status) {
    case 429:
      return {
        statusText,
        message: 'Rate limit exceeded. Please try again later.',
      };
    case 401:
      return { statusText, message: 'Invalid credentials' };
    case 403:
      return { statusText, message: 'Access denied' };
    case 404:
      return { statusText, message: 'User not found' };
    default:
      if (statusText === 'BAD_REQUEST') {
        return { statusText, message };
      } else {
        return { statusText, message: 'An unexpected error occurred' };
      }
  }
};

export default ApiErrorFunc;

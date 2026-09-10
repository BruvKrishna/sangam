import { format } from 'date-fns';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'HH:mm');
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).replace(/_/g, ' ');
};

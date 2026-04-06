export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value || 0);
}

export function formatName(name) {
  if (!name) return '';
  return name.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export function getInitials(name) {
  const parts = formatName(name).split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

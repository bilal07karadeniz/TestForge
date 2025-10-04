import { ExternalLink } from 'lucide-react';
import { getExplorerUrl } from '../utils/constants';

export default function ExplorerLink({ type, hash, children, className = '' }) {
  const url = getExplorerUrl(type, hash);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-primary hover:text-secondary transition-colors ${className}`}
    >
      {children || hash}
      <ExternalLink size={14} />
    </a>
  );
}

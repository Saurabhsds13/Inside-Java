import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-slate-400',
        className
      )}
    >
      {children}
    </span>
  );
}

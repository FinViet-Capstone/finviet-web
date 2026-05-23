import { HelpCircle } from 'lucide-react';

interface Props {
  text: string;
  /** Tailwind width class for the tooltip bubble (default w-64). */
  width?: string;
  /** Where the bubble appears relative to the icon. */
  placement?: 'bottom' | 'top' | 'left';
}

export function InfoTooltip({ text, width = 'w-64', placement = 'bottom' }: Props) {
  const placementClass =
    placement === 'top'
      ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2'
      : placement === 'left'
      ? 'right-full mr-1.5 top-1/2 -translate-y-1/2'
      : 'top-full mt-1.5 left-1/2 -translate-x-1/2';

  return (
    <span className="group relative inline-flex">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${placementClass} z-10 ${width} rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}

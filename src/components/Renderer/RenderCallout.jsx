import { memo } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const VARIANTS = {
  info: {
    icon: Info,
    title: 'Info',
    containerStyle: 'bg-zinc-100/70 border-zinc-300 text-zinc-900',
    iconStyle: 'text-zinc-700',
  },
  warning: {
    icon: AlertTriangle,
    title: 'Warning',
    containerStyle: 'bg-amber-50/70 border-amber-300 text-amber-900',
    iconStyle: 'text-amber-700',
  },
  success: {
    icon: CheckCircle2,
    title: 'Success',
    containerStyle: 'bg-emerald-50/70 border-emerald-300 text-emerald-900',
    iconStyle: 'text-emerald-700',
  },
  error: {
    icon: XCircle,
    title: 'Error',
    containerStyle: 'bg-rose-50/70 border-rose-300 text-rose-900',
    iconStyle: 'text-rose-700',
  },
};

/**
 * RenderCallout — Renders styled alert callouts (Info, Warning, Success, Error).
 */
const RenderCallout = memo(({ content }) => {
  const text = content?.text || '';
  const variantKey = (content?.variant || 'info').toLowerCase();
  const config = VARIANTS[variantKey] || VARIANTS.info;
  const IconComponent = config.icon;

  if (!text.trim()) return null;

  return (
    <aside
      className={`my-5 p-4 rounded-xl border flex items-start gap-3 shadow-xs ${config.containerStyle}`}
    >
      <IconComponent size={20} className={`shrink-0 mt-0.5 ${config.iconStyle}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{text}</p>
      </div>
    </aside>
  );
});

RenderCallout.displayName = 'RenderCallout';

export default RenderCallout;

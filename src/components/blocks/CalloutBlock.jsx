import { useState, useRef, useEffect, useCallback } from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

/**
 * CalloutBlock — Colored alert/callout with variant selector.
 *
 * Content schema: { text: string, variant: 'info' | 'warning' | 'success' | 'error' }
 *
 * Props:
 * - id: string — Block ID
 * - content: { text: string, variant: string } — Current callout data
 * - onUpdate: (content: object) => void — Callback to update store
 */

const VARIANTS = {
  info: {
    icon: Info,
    label: 'Info',
    bg: 'bg-black/[0.03]',
    border: 'border-black/10',
    iconColor: 'text-black/60',
    textColor: 'text-black/50',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bg: 'bg-black/[0.05]',
    border: 'border-black/12',
    iconColor: 'text-black/70',
    textColor: 'text-black/60',
  },
  success: {
    icon: CheckCircle2,
    label: 'Success',
    bg: 'bg-black/[0.03]',
    border: 'border-black/10',
    iconColor: 'text-black/60',
    textColor: 'text-black/50',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    bg: 'bg-black/[0.05]',
    border: 'border-black/12',
    iconColor: 'text-black/70',
    textColor: 'text-black/60',
  },
};

const VARIANT_KEYS = Object.keys(VARIANTS);

const CalloutBlock = ({ id, content, onUpdate }) => {
  const [text, setText] = useState(content?.text || '');
  const [variant, setVariant] = useState(content?.variant || 'info');
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync from parent (undo/redo)
  useEffect(() => {
    setText(content?.text || '');
    setVariant(content?.variant || 'info');
  }, [content]);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  const debouncedUpdate = useCallback((newText, newVariant) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ text: newText, variant: newVariant });
    }, 400);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    debouncedUpdate(newText, variant);
  };

  const cycleVariant = () => {
    const currentIdx = VARIANT_KEYS.indexOf(variant);
    const nextVariant = VARIANT_KEYS[(currentIdx + 1) % VARIANT_KEYS.length];
    setVariant(nextVariant);
    onUpdate({ text, variant: nextVariant });
  };

  const config = VARIANTS[variant] || VARIANTS.info;
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border ${config.bg} ${config.border} px-4 py-3`}>
      <div className="flex items-start gap-3">
        {/* Variant Icon (click to cycle) */}
        <button
          id={`block-callout-variant-${id}`}
          onClick={cycleVariant}
          title={`${config.label} — Click to change variant`}
          className={`shrink-0 mt-0.5 p-1 rounded-md ${config.iconColor} 
                     hover:bg-black/5 transition-colors duration-200`}
        >
          <IconComponent size={18} />
        </button>

        {/* Callout Text */}
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold uppercase tracking-wider ${config.iconColor} block mb-1`}>
            {config.label}
          </span>
          <textarea
            ref={textareaRef}
            id={`block-callout-text-${id}`}
            value={text}
            onChange={handleTextChange}
            placeholder={`${config.label} message...`}
            rows={1}
            className="w-full bg-transparent text-text-primary placeholder-text-placeholder/50
                       text-sm leading-relaxed resize-none border-none outline-none
                       py-0 px-0 focus-ring rounded-sm"
            spellCheck={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CalloutBlock;

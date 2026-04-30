import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * ImageBlock — Image URL input + live preview.
 *
 * Content schema: { url: string, alt: string }
 *
 * Props:
 * - id: string — Block ID
 * - content: { url: string, alt: string } — Current image data
 * - onUpdate: (content: object) => void — Callback to update store
 */
const ImageBlock = ({ id, content, onUpdate }) => {
  const [url, setUrl] = useState(content?.url || '');
  const [alt, setAlt] = useState(content?.alt || '');
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const debounceRef = useRef(null);

  // Sync from parent (undo/redo)
  useEffect(() => {
    setUrl(content?.url || '');
    setAlt(content?.alt || '');
    setHasError(false);
    setIsLoaded(false);
  }, [content]);

  const debouncedUpdate = useCallback((newUrl, newAlt) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate({ url: newUrl, alt: newAlt });
    }, 400);
  }, [onUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setHasError(false);
    setIsLoaded(false);
    debouncedUpdate(newUrl, alt);
  };

  const handleAltChange = (e) => {
    const newAlt = e.target.value;
    setAlt(newAlt);
    debouncedUpdate(url, newAlt);
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="flex items-center gap-2">
        <ImageIcon size={16} className="text-text-muted shrink-0" />
        <input
          id={`block-image-url-${id}`}
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Paste image URL..."
          className="w-full bg-bg-tertiary text-text-primary placeholder-text-placeholder
                     text-sm rounded-lg border border-border-default px-3 py-2
                     outline-none transition-colors duration-200
                     hover:border-border-hover focus:border-border-focus"
        />
      </div>

      {/* Alt Text Input */}
      <input
        id={`block-image-alt-${id}`}
        type="text"
        value={alt}
        onChange={handleAltChange}
        placeholder="Alt text (optional)"
        className="w-full bg-bg-tertiary text-text-secondary placeholder-text-placeholder
                   text-xs rounded-lg border border-border-default px-3 py-1.5
                   outline-none transition-colors duration-200
                   hover:border-border-hover focus:border-border-focus"
      />

      {/* Image Preview */}
      {url && !hasError && (
        <div className="relative overflow-hidden rounded-lg border border-border-default bg-bg-tertiary">
          <img
            src={url}
            alt={alt || 'Block image'}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full max-h-80 object-cover transition-opacity duration-500
                       ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {hasError && url && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-subtle border border-danger/20 px-3 py-2">
          <ImageIcon size={14} className="text-danger" />
          <span className="text-xs text-danger">Failed to load image. Check the URL.</span>
        </div>
      )}

      {/* Empty State */}
      {!url && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed 
                        border-border-default py-8 text-text-muted">
          <ImageIcon size={32} className="mb-2 opacity-40" />
          <span className="text-sm">Paste an image URL above</span>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;

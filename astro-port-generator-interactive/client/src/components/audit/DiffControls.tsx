import React, { useState } from 'react';
import { NormalizationOptions, FileDiff } from '../../hooks/useAudit';

interface DiffControlsProps {
  normalizationOptions: NormalizationOptions;
  onUpdateNormalization: (options: Partial<NormalizationOptions>) => void;
  fileDiff: FileDiff | null;
  onCopyDiff: (diff: FileDiff) => Promise<boolean>;
  onRefresh: () => void;
  loading?: boolean;
}

export default function DiffControls({
  normalizationOptions,
  onUpdateNormalization,
  fileDiff,
  onCopyDiff,
  onRefresh,
  loading = false
}: DiffControlsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const handleCopyDiff = async () => {
    if (!fileDiff) return;

    setCopyStatus('copying');
    try {
      const success = await onCopyDiff(fileDiff);
      setCopyStatus(success ? 'success' : 'error');
      
      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying':
        return 'COPYING...';
      case 'success':
        return 'COPIED!';
      case 'error':
        return 'FAILED';
      default:
        return 'COPY DIFF';
    }
  };

  const getCopyButtonClass = () => {
    const baseClass = 'bloomberg-button';
    switch (copyStatus) {
      case 'success':
        return `${baseClass} text-bloomberg-green border-bloomberg-green`;
      case 'error':
        return `${baseClass} text-bloomberg-red border-bloomberg-red`;
      case 'copying':
        return `${baseClass} opacity-50`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="bloomberg-section">
      {/* Header */}
      <div className="bloomberg-header">
        <div className="flex items-center justify-between">
          <span>CONTROLS</span>
          <span className="text-bloomberg-orange">│</span>
          <span className="text-bloomberg-muted">NORMALIZATION</span>
        </div>
      </div>

      {/* Normalization Options */}
      <div className="p-3 space-y-3">
        <div className="text-xs text-bloomberg-muted mb-2 uppercase">
          Normalization Options
        </div>

        {/* Always-on normalizations */}
        <div className="space-y-2 pb-2 border-b border-bloomberg-border">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-bloomberg-green">✓</span>
            <span className="text-bloomberg-muted">Quote normalization (always on)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-bloomberg-green">✓</span>
            <span className="text-bloomberg-muted">Whitespace normalization (always on)</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-bloomberg-green">✓</span>
            <span className="text-bloomberg-muted">Attribute order normalization (always on)</span>
          </div>
        </div>

        {/* Optional normalizations */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-bloomberg-panel p-1 -m-1">
            <input
              type="checkbox"
              checked={normalizationOptions.removeAssetVersions}
              onChange={(e) => onUpdateNormalization({ removeAssetVersions: e.target.checked })}
              className="sr-only"
            />
            <span className={`
              w-4 h-4 border border-bloomberg-border flex items-center justify-center text-xs
              ${normalizationOptions.removeAssetVersions 
                ? 'bg-bloomberg-orange text-black' 
                : 'bg-bloomberg-bg'
              }
            `}>
              {normalizationOptions.removeAssetVersions ? '✓' : ''}
            </span>
            <span className="text-bloomberg-text text-xs">Remove asset versioning</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:bg-bloomberg-panel p-1 -m-1">
            <input
              type="checkbox"
              checked={normalizationOptions.normalizeCSSOrder}
              onChange={(e) => onUpdateNormalization({ normalizeCSSOrder: e.target.checked })}
              className="sr-only"
            />
            <span className={`
              w-4 h-4 border border-bloomberg-border flex items-center justify-center text-xs
              ${normalizationOptions.normalizeCSSOrder 
                ? 'bg-bloomberg-orange text-black' 
                : 'bg-bloomberg-bg'
              }
            `}>
              {normalizationOptions.normalizeCSSOrder ? '✓' : ''}
            </span>
            <span className="text-bloomberg-text text-xs">Normalize CSS link order</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:bg-bloomberg-panel p-1 -m-1">
            <input
              type="checkbox"
              checked={normalizationOptions.minifyHTML}
              onChange={(e) => onUpdateNormalization({ minifyHTML: e.target.checked })}
              className="sr-only"
            />
            <span className={`
              w-4 h-4 border border-bloomberg-border flex items-center justify-center text-xs
              ${normalizationOptions.minifyHTML 
                ? 'bg-bloomberg-orange text-black' 
                : 'bg-bloomberg-bg'
              }
            `}>
              {normalizationOptions.minifyHTML ? '✓' : ''}
            </span>
            <span className="text-bloomberg-text text-xs">Minify HTML</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-bloomberg-border p-3 space-y-2">
        <div className="text-xs text-bloomberg-muted mb-2 uppercase">
          Actions
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="bloomberg-button w-full justify-center"
        >
          {loading ? 'REFRESHING...' : 'REFRESH FILES'}
        </button>

        <button
          onClick={handleCopyDiff}
          disabled={!fileDiff || copyStatus === 'copying'}
          className={`${getCopyButtonClass()} w-full justify-center`}
        >
          {getCopyButtonText()}
        </button>
      </div>

      {/* Help Text */}
      <div className="border-t border-bloomberg-border p-3">
        <div className="text-xs text-bloomberg-muted space-y-1">
          <div className="uppercase mb-1">Copy Format:</div>
          <div>• File path</div>
          <div>• Middleman HTML</div>
          <div>• Astro HTML</div>
          <div>• Normalized diff</div>
          <div>• Raw diff</div>
        </div>
      </div>

      {/* Status */}
      {fileDiff && (
        <div className="border-t border-bloomberg-border p-3">
          <div className="text-xs">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-bloomberg-muted">STATUS:</span>
              <span className={fileDiff.identical ? 'text-bloomberg-green' : 'text-bloomberg-red'}>
                {fileDiff.identical ? 'IDENTICAL' : 'DIFFERENT'}
              </span>
            </div>
            <div className="text-bloomberg-muted">
              Selected: {fileDiff.file}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
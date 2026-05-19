import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import ThemePicker from './ThemePicker';
import FormatPicker from './FormatPicker';
import CardPreview from './CardPreview';
import { getRecommendedTheme } from '../../utils/cardHelpers';
import { fireShareEvent } from '../../utils/shareAnalytics';

/**
 * SharePanel — Full-screen modal for generating and sharing trip cards.
 *
 * Uses createPortal to render directly into document.body, escaping
 * any overflow:hidden or z-index stacking contexts from parent layouts.
 *
 * NO framer-motion AnimatePresence — that was causing the "nothing pops up"
 * bug. Uses simple CSS transitions instead for reliability.
 */
export default function SharePanel({ isOpen, onClose, trip }) {
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [selectedFormat, setSelectedFormat] = useState('story');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadState, setDownloadState] = useState('idle');
  const [copied, setCopied] = useState(false);
  const captureRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && trip) {
      setSelectedTheme(getRecommendedTheme(trip.travelStyle));
      setSelectedFormat('story');
      setDownloadState('idle');
      setCopied(false);
    }
  }, [isOpen, trip]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // ─── Download PNG ─────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return;
    setDownloadState('generating');

    try {
      await document.fonts.ready;

      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setDownloadState('error');
            setTimeout(() => setDownloadState('idle'), 3000);
            return;
          }

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = `GoTrip-${(trip.destination || 'Trip').replace(/\s+/g, '-')}.png`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setDownloadState('success');
          setTimeout(() => setDownloadState('idle'), 2500);

          fireShareEvent(trip._id, {
            platform: 'download',
            theme: selectedTheme,
            format: selectedFormat,
          });
        },
        'image/png',
        1.0,
      );
    } catch (err) {
      console.error('Card export failed:', err);
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 3000);
    }
  }, [trip, selectedTheme, selectedFormat]);

  // ─── Copy Link ────────────────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/trip/${trip._id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    fireShareEvent(trip._id, { platform: 'link', theme: selectedTheme, format: selectedFormat });
  }, [trip, selectedTheme, selectedFormat]);

  // ─── WhatsApp ─────────────────────────────────────────────────
  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(
      `Check out my ${trip.duration}-day trip to ${trip.destination} planned with GoTrip Pro! 🌍\n\n${window.location.origin}/trip/${trip._id}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    fireShareEvent(trip._id, { platform: 'whatsapp', theme: selectedTheme, format: selectedFormat });
  }, [trip, selectedTheme, selectedFormat]);

  // ─── Native Share ─────────────────────────────────────────────
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share || !captureRef.current) return;
    try {
      setIsGenerating(true);
      await document.fonts.ready;
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      const file = new File([blob], 'GoTrip-card.png', { type: 'image/png' });

      await navigator.share({
        title: `My ${trip.duration}-day trip to ${trip.destination}`,
        text: 'Planned with GoTrip Pro 🌍',
        url: `${window.location.origin}/trip/${trip._id}`,
        files: [file],
      });
      fireShareEvent(trip._id, { platform: 'native', theme: selectedTheme, format: selectedFormat });
    } catch (err) {
      if (err.name !== 'AbortError') console.warn('Native share failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [trip, selectedTheme, selectedFormat]);

  const supportsNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ─── Guard ────────────────────────────────────────────────────
  if (!trip || !isOpen) return null;

  const downloadBtnText = {
    idle: '↓ Download PNG',
    generating: '⟳ Generating…',
    success: '✓ Downloaded!',
    error: '↓ Retry Download',
  }[downloadState];

  // ─── Render via Portal ────────────────────────────────────────
  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'sharePanel-fadeIn 0.25s ease',
      }}
    >
      {/* Inject keyframes */}
      <style>{`
        @keyframes sharePanel-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sharePanel-slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .share-panel-scroll::-webkit-scrollbar { width: 5px; }
        .share-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .share-panel-scroll::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 10px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Panel */}
      <div
        className="share-panel-scroll"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-primary, #1a1a2e)',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          maxHeight: '92vh',
          overflowY: 'auto',
          width: 'min(540px, calc(100vw - 24px))',
          padding: '24px 22px',
          animation: 'sharePanel-slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary, #fff)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ✨ Create Share Card
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-glass, rgba(255,255,255,0.06))',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderRadius: 8,
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: 'var(--text-muted, #888)',
              transition: 'all 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Theme Picker */}
        <SectionLabel>Theme</SectionLabel>
        <ThemePicker
          selected={selectedTheme}
          onSelect={setSelectedTheme}
          travelStyle={trip.travelStyle}
        />

        {/* Format Picker */}
        <SectionLabel style={{ marginTop: 18 }}>Format</SectionLabel>
        <FormatPicker selected={selectedFormat} onSelect={setSelectedFormat} />

        {/* Preview */}
        <SectionLabel style={{ marginTop: 18 }}>Preview</SectionLabel>
        <CardPreview
          trip={trip}
          theme={selectedTheme}
          format={selectedFormat}
          captureRef={captureRef}
        />

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginTop: 20,
        }}>
          <ActionButton
            onClick={handleDownload}
            disabled={downloadState === 'generating'}
            primary
            success={downloadState === 'success'}
          >
            {downloadBtnText}
          </ActionButton>

          <ActionButton onClick={handleCopyLink} success={copied}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </ActionButton>

          <ActionButton onClick={handleWhatsApp} whatsapp>
            💬 WhatsApp
          </ActionButton>

          {supportsNativeShare && (
            <ActionButton onClick={handleNativeShare} disabled={isGenerating}>
              {isGenerating ? '⟳ …' : '📤 Share'}
            </ActionButton>
          )}
        </div>

        {/* Error */}
        {downloadState === 'error' && (
          <p style={{
            fontSize: '0.78rem',
            color: '#ef4444',
            textAlign: 'center',
            marginTop: 10,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Export failed. Try again.
          </p>
        )}

        {/* Share count */}
        {trip.shares?.total > 0 && (
          <div style={{
            textAlign: 'center',
            marginTop: 12,
            fontSize: '0.72rem',
            color: 'var(--text-muted, #888)',
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Shared {trip.shares.total} {trip.shares.total === 1 ? 'time' : 'times'}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Helper Components ────────────────────────────────────────────

function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: '0.72rem',
      fontWeight: 700,
      color: 'var(--text-muted, #888)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: 8,
      fontFamily: "'DM Sans', sans-serif",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, primary, success, whatsapp }) {
  let bg = 'transparent';
  let color = 'var(--text-primary, #fff)';
  let border = '1px solid var(--border-color, rgba(255,255,255,0.08))';

  if (primary && !success) {
    bg = 'var(--color-primary, #6366f1)';
    color = '#fff';
    border = 'none';
  }
  if (success) {
    bg = 'rgba(34, 197, 94, 0.12)';
    color = '#22c55e';
    border = '1px solid rgba(34, 197, 94, 0.3)';
  }
  if (whatsapp) {
    bg = 'linear-gradient(135deg, #25D366, #128C7E)';
    color = '#fff';
    border = 'none';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minWidth: 100,
        padding: '9px 14px',
        borderRadius: 10,
        border,
        background: bg,
        color,
        fontWeight: 700,
        fontSize: '0.8rem',
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s',
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

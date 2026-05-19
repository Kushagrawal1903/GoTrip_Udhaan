import TripCard from './TripCard';
import { CARD_FORMATS } from '../../utils/cardFormats';

/**
 * CardPreview — Scaled-down live preview + hidden full-size capture target.
 *
 * The visible preview is scaled to fit within ~320px width.
 * The hidden capture target is rendered off-screen at full resolution
 * for html2canvas to capture at retina quality.
 */
export default function CardPreview({ trip, theme, format, captureRef }) {
  const { width, height } = CARD_FORMATS[format] || CARD_FORMATS.story;

  // Scale to fit within the preview container
  const maxPreviewWidth = 320;
  const maxPreviewHeight = 420;
  const scaleW = maxPreviewWidth / width;
  const scaleH = maxPreviewHeight / height;
  const previewScale = Math.min(scaleW, scaleH);

  return (
    <div>
      {/* Visible preview — scaled down */}
      <div
        style={{
          width: width * previewScale,
          height: height * previewScale,
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative',
          background: '#0a0a0a',
        }}
      >
        <div
          key={`${theme}-${format}`}
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
            width,
            height,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <TripCard trip={trip} theme={theme} format={format} />
        </div>
      </div>

      {/* Hidden capture target — full resolution, off-screen */}
      <div
        ref={captureRef}
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 1, // must be visible to html2canvas
        }}
      >
        <TripCard trip={trip} theme={theme} format={format} />
      </div>
    </div>
  );
}

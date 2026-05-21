/**
 * LoadingState — Premium skeleton + spinner for map loading
 */
export default function LoadingState() {
    return (
        <div className="map-loading-state">
            <div className="map-loading-spinner" />
            <p className="map-loading-text">Mapping your trip…</p>
            <p className="map-loading-subtext">Locating places via OpenStreetMap</p>
        </div>
    );
}

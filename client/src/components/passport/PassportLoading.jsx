export default function PassportLoading({ message = "Revisiting your memories..." }) {
    return (
        <div className="passport-loading passport-page-inner" style={{ background: 'var(--pp-leather)' }}>
            <h2 className="passport-loading-title">{message}</h2>
            <div className="passport-loading-bar">
                <div className="passport-loading-bar-fill"></div>
            </div>
        </div>
    );
}

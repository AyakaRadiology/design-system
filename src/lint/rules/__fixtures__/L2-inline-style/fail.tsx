export function Trace({ styles }: { styles: Record<string, string> }) {
    return (
        <>
            <div style={{ background: "var(--bg)" }} />
            <div style={{ transform: "translateX(2px)", padding: "4px" }} />
            <div style={styles} />
            <div style={{ ...styles }} />
            <div style={styles as CSSProperties} />
            <div style={{ color: "var(--text)" } as CSSProperties} />
        </>
    );
}

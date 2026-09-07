export function Trace({ x }: { x: number }) {
    return (
        <>
            <div style={{ "--x-trace-offset": `${x}px` }} className="bg-bg" />
            <div style={{ transform: `translateX(${x}px)`, width: x, opacity: 0.5 }} />
            <div style={{ "--x-trace-chars": x } as TraceStyle} className="bg-bg" />
        </>
    );
}

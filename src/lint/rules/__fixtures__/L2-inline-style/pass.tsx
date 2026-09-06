export function Trace({ x }: { x: number }) {
    return (
        <>
            <div style={{ "--x-trace-offset": `${x}px` }} className="bg-bg" />
            <div style={{ transform: `translateX(${x}px)`, width: x, opacity: 0.5 }} />
        </>
    );
}

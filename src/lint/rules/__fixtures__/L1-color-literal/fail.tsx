export function Swatch() {
    const hex = "#1e293b";
    const fn = "rgb(30 41 59)";
    const mixed = `oklch(0.5 0.1 200)`;
    return <div title={hex + fn + mixed} className="border" />;
}

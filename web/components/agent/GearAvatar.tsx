export function GearAvatar() {
  const n = 8;
  const outerR = 23;
  const innerR = 15;
  const holeR = 8.5;
  const step = (Math.PI * 2) / n;
  const half = step * 0.30;

  let d = "";
  for (let i = 0; i < n; i++) {
    const a = i * step - Math.PI / 2;
    const a0 = a - half;
    const a1 = a + half;
    const ve = a + step - half;

    const ix0 = innerR * Math.cos(a0), iy0 = innerR * Math.sin(a0);
    const ox0 = outerR * Math.cos(a0), oy0 = outerR * Math.sin(a0);
    const ox1 = outerR * Math.cos(a1), oy1 = outerR * Math.sin(a1);
    const ix1 = innerR * Math.cos(a1), iy1 = innerR * Math.sin(a1);
    const vex = innerR * Math.cos(ve), vey = innerR * Math.sin(ve);

    const cmd = i === 0 ? "M" : "L";
    d += `${cmd}${ix0.toFixed(3)},${iy0.toFixed(3)}`;
    d += `L${ox0.toFixed(3)},${oy0.toFixed(3)}`;
    d += `L${ox1.toFixed(3)},${oy1.toFixed(3)}`;
    d += `L${ix1.toFixed(3)},${iy1.toFixed(3)}`;
    d += `A${innerR},${innerR} 0 0,1 ${vex.toFixed(3)},${vey.toFixed(3)}`;
  }
  d += "Z";

  const holeD = `M${holeR},0 A${holeR},${holeR} 0 1,1 -${holeR},0 A${holeR},${holeR} 0 1,1 ${holeR},0 Z`;

  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#0A2240] flex items-center justify-center">
      <svg viewBox="-36 -36 72 72" width="20" height="20" aria-hidden="true">
        <path d={`${d} ${holeD}`} fill="#0A2240" fillRule="evenodd" />
      </svg>
    </div>
  );
}

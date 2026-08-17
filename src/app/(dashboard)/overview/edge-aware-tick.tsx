interface TickProps {
  x: number | string;
  y: number | string;
  payload: { value: string };
  index: number;
}

/**
 * Renders only the first and last tick's text — every other tick (still a real, distinct data
 * point for hover/tooltip purposes, see chart-data.ts) stays visually blank on the axis.
 */
export function edgeAwareTick(dataLength: number) {
  return function EdgeAwareTick({ x, y, payload, index }: TickProps) {
    if (index !== 0 && index !== dataLength - 1) {
      return <g />;
    }
    const textAnchor = index === 0 ? "start" : "end";
    return (
      <text x={x} y={Number(y) + 12} textAnchor={textAnchor} fontSize={12} fill="#64748b">
        {payload.value}
      </text>
    );
  };
}

interface TickProps {
  x: number | string;
  y: number | string;
  payload: { value: string };
  index: number;
}

export function edgeAwareTick(dataLength: number) {
  return function EdgeAwareTick({ x, y, payload, index }: TickProps) {
    const textAnchor = index === 0 ? "start" : index === dataLength - 1 ? "end" : "middle";
    return (
      <text x={x} y={Number(y) + 12} textAnchor={textAnchor} fontSize={12} fill="#64748b">
        {payload.value}
      </text>
    );
  };
}

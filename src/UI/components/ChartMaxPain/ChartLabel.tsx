// Types
type ChartLabelProps = {
  label: string;
  viewBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  value: string | number;
  offset?: number;
};

const ChartLabel = ({ label, viewBox, value, offset = 0 }: ChartLabelProps) => {
  if (!viewBox) return null;

  const centerX = viewBox.x + offset;
  const centerY = -15;
  const rotation = `rotate(90, ${centerX}, ${centerY})`;

  return (
    <text x={centerX} y={centerY} dx={40} fill='#fff' fontSize={12} textAnchor='start' transform={rotation}>
      <tspan fill='#9D9DAA' fontSize={10} fontWeight={"500"}>
        {label}
      </tspan>
      <tspan dx={3} fill='#fff' fontSize={12}>
        {value}
      </tspan>
    </text>
  );
};

export default ChartLabel;

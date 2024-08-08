// Types
type DownsideTextProps = {
  x: number;
  y: number;
};

const DownsideText = (props: DownsideTextProps) => {
  const { y, x } = props;
  return (
    <text x={x} y={y + 20} fill={"white"} fontSize={10} fontWeight={600} textAnchor='left'>
      No Downside
    </text>
  );
};

export default DownsideText;

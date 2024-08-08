// Types
type ChartCursorProps = {
  x: number;
};

const ChartCursor = ({ x }: ChartCursorProps) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='2' height='400' viewBox='0 0 2 400' fill='none' x={x - 2} y={0}>
    <path d='M1 0L1.00002 400' stroke='url(#paint0_linear_2644_41273)' />
    <defs>
      <linearGradient
        id='paint0_linear_2644_41273'
        x1='1.5'
        y1='-2.18571e-08'
        x2='1.50002'
        y2='400'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='white' />
        <stop offset='1' stopColor='white' stopOpacity='0' />
      </linearGradient>
    </defs>
  </svg>
);

export default ChartCursor;

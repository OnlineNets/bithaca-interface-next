import { IconProps } from "./types";

const SquareBracketLeft = ({ color = "#9D9DAA" }: IconProps) => {
  return (
    <svg width='3' height='27' viewBox='0 0 3 27' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M3.00001 27L3.00001 25.8549L1.47607 25.8549L1.47606 1.14509L3 1.14509L3 1.82071e-06L-7.14504e-06 1.90735e-06L0 27L3.00001 27Z'
        fill={color}
      />
    </svg>
  );
};

export default SquareBracketLeft;

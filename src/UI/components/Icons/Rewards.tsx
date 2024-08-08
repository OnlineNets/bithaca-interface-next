// Types
type RewardsProps = {
  onClick?: () => void;
  strokeColor?: string;
};

const Rewards = ({ onClick, strokeColor }: RewardsProps) => {
  const stroke = strokeColor || "#9D9DAA";

  return (
    <div onClick={onClick}>
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g clipPath='url(#clip0_4768_13795)'>
          <path
            d='M8.5 11.5L5.5 13L6 9.5L4 7.5L7 7L8.5 4L10 7L13 7.5L11 9.5L11.5 13L8.5 11.5Z'
            stroke={stroke}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M19 20L14 15' stroke={stroke} strokeLinecap='round' strokeLinejoin='round' />
          <path d='M14 20L10.5 16.5' stroke={stroke} strokeLinecap='round' strokeLinejoin='round' />
          <path d='M19 15L15.5 11.5' stroke={stroke} strokeLinecap='round' strokeLinejoin='round' />
        </g>
        <defs>
          <clipPath id='clip0_4768_13795'>
            <rect width='24' height='24' fill='white' />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default Rewards;

const ChevronLeftRight = ({ colorGreater = "#54565b", colorLess = "white" }) => {
  return (
    <svg
      className='width-12 height-25 ml-6'
      width='12'
      height='25'
      viewBox='0 0 12 25'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M7 16L4 19L7 22' stroke={colorGreater} strokeLinecap='round' />
      <path d='M5 9L8 6L5 3' stroke={colorLess} strokeLinecap='round' />
    </svg>
  );
};

export default ChevronLeftRight;

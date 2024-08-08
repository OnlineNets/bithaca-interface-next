const Calendar = () => {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='16' height='16' rx='4' fill='#35333E' />
      <path
        d='M3 6C3 5.22037 3 4.83056 3.17882 4.54596C3.27207 4.39756 3.39756 4.27207 3.54596 4.17882C3.83056 4 4.22037 4 5 4H11C11.7796 4 12.1694 4 12.454 4.17882C12.6024 4.27207 12.7279 4.39756 12.8212 4.54596C13 4.83056 13 5.22037 13 6V6H3V6Z'
        stroke='white'
      />
      <rect x='3' y='4' width='10' height='8' rx='1.16667' stroke='white' />
      <path d='M6 3L6 4' stroke='white' strokeLinecap='round' />
      <path d='M10 3L10 4' stroke='white' strokeLinecap='round' />
    </svg>
  );
};

export default Calendar;

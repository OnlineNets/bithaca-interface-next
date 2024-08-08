// Types
type LogoEthProps = {
  className?: string;
};

const LogoEth = ({ className }: LogoEthProps) => {
  return (
    <svg
      className={className}
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle cx='8' cy='8' r='8' fill='#35333E' />
      <path
        d='M7.99961 3.05518L7.92969 3.27395V9.62161L7.99961 9.68587L11.1986 7.94419L7.99961 3.05518Z'
        fill='#D1D1D1'
      />
      <path d='M7.99984 3.05518L4.80078 7.94419L7.99984 9.68587V6.60489V3.05518Z' fill='white' />
      <path
        d='M8.00035 10.2437L7.96094 10.288V12.5491L8.00035 12.6551L11.2013 8.50293L8.00035 10.2437Z'
        fill='#D1D1D1'
      />
      <path d='M7.99984 12.6551V10.2437L4.80078 8.50293L7.99984 12.6551Z' fill='white' />
      <path d='M8 9.68596L11.199 7.94429L8 6.60498V9.68596Z' fill='#8F8E8E' />
      <path d='M4.80078 7.94429L7.99984 9.68596V6.60498L4.80078 7.94429Z' fill='#AFA8A8' />
    </svg>
  );
};

export default LogoEth;

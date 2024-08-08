type LogoProps = {
  className?: string;
};

const IthacaLogoLabel = ({ className }: LogoProps) => {
  return (
    <svg
      className={className}
      width='65'
      height='32'
      viewBox='0 0 65 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g filter='url(#filter0_dd_10336_162427)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M30.5683 20.165L36.7565 22.8496L33.4112 9.65732L30.8195 19.2564L29.9797 22.3539L29.1434 25.4102L28.1074 25.0523L33.4146 7.52344L38.6996 25.4102L30.5683 20.165Z'
          fill='white'
        />
        <path
          d='M46.3371 23.9726L45.5264 25.1077L37.7852 15.6685L45.4348 6.47656L46.2523 7.5977L39.1217 15.6302L46.3371 23.9726Z'
          fill='white'
        />
        <path
          d='M26.247 10.5742V25.2085H25.3005V18.3457H17.9523V25.2085H17.0059V10.5742H17.9523V17.382H25.3005V10.5742H26.247Z'
          fill='white'
        />
        <path d='M26.2393 6.54297V7.50666H14.1244V25.2041H13.1779V7.50666H8.49023V6.54297H26.2393Z' fill='white' />
        <path d='M6.98666 6.53516H6.01953V25.2135H6.98666V6.53516Z' fill='white' />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M50.9355 20.165L57.1237 22.8496L53.7783 9.65732L51.1867 19.2564L50.3469 22.3539L49.5106 25.4102L48.4746 25.0523L53.7818 7.52344L59.0667 25.4102L50.9355 20.165Z'
          fill='white'
        />
      </g>
      <defs>
        <filter
          id='filter0_dd_10336_162427'
          x='0.407937'
          y='0.864968'
          width='64.2701'
          height='30.1568'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset />
          <feGaussianBlur stdDeviation='2.8058' />
          <feColorMatrix type='matrix' values='0 0 0 0 0.643137 0 0 0 0 0.956863 0 0 0 0 0.85098 0 0 0 0.5 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_10336_162427' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset />
          <feGaussianBlur stdDeviation='2.8058' />
          <feColorMatrix type='matrix' values='0 0 0 0 0.643137 0 0 0 0 0.956863 0 0 0 0 0.85098 0 0 0 0.65 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_10336_162427' result='effect2_dropShadow_10336_162427' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect2_dropShadow_10336_162427' result='shape' />
        </filter>
      </defs>
    </svg>
  );
};

export default IthacaLogoLabel;

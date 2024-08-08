interface UpsideDownsideProps {
  type: "Call" | "Put";
}

const UpsideDownside = (props: UpsideDownsideProps) => {
  const { type } = props;

  return (
    <span className='flex-column-center'>
      <span className={type == "Call" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>Upside</span>
      <span className={type == "Put" ? "color-white hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>Downside</span>
    </span>
  );
};

export default UpsideDownside;

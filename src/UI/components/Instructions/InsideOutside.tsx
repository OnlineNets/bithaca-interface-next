interface InsideOutsideProps {
  type: "INSIDE" | "OUTSIDE";
}

const InsideOutside = (props: InsideOutsideProps) => {
  const { type } = props;

  return (
    <span className='flex-column-center'>
      <span className={type == "INSIDE" ? "hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>Inside</span>
      <span className={type == "OUTSIDE" ? "hide-psuedo p-0" : "color-white-30 hide-psuedo p-0"}>Outside</span>
    </span>
  );
};

export default InsideOutside;

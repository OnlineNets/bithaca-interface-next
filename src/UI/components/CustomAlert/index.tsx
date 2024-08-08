import ConnectIcon from "@/assets/icons/connect.svg";
import Image from "next/image";

interface Props {
  title: string;
  content: string;
}

const CustomAlert = ({ title, content }: Props) => (
  <div className='tw-flex tw-space-x-2.5 tw-rounded-[16px] tw-bg-[rgba(18,23,34,.9)] tw-p-5'>
    <div className='tw-min-h-6 tw-min-w-6'>
      <ConnectIcon />
    </div>
    <div className='tw-flex tw-flex-col tw-space-y-2.5 tw-text-white'>
      <span className='tw-mt-0.5 tw-font-lato tw-text-[18px] tw-font-semibold'>{title}</span>
      <span className='tw-font-lato tw-text-[16px]'>{content}</span>
    </div>
  </div>
);

export default CustomAlert;

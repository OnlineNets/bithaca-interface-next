import React from "react";
import MobileIcon from "@/UI/components/Icons/MobileIcon";
import Modal from "@/UI/components/Modal/Modal";
import { QRCode } from "@farcaster/auth-kit";

interface Props {
  isOpen: boolean;
  url?: string;
  onCloseModal: () => void;
}

export function FarcasterModal({ url, isOpen, onCloseModal }: Props) {
  return (
    <Modal title='Sign in with Farcaster' isOpen={isOpen} onCloseModal={onCloseModal}>
      <div className='flex align-center justify-center items-center flex-1 flex-column'>
        <p className='mb-12'>Scan with your phone&apos;s camera to continue.</p>
        <div style={{ width: 270, height: 300 }} className='mt-16'>
          <div className='border-[rgba(229, 231, 235, 0.333)] w-full rounded-lg border p-4 border-default'>
            {url && <QRCode uri={url} size={260} logoSize={0} />}
          </div>
        </div>
        <div className='flex flex-row'>
          <div className='mr-4'>
            <MobileIcon />
          </div>
          <a href={url} className='pl-2 ml-2 link'>
            I&apos;m using my phone →
          </a>
        </div>
      </div>
    </Modal>
  );
}

export default FarcasterModal;

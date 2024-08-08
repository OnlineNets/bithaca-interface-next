// Components
import Button from "@/UI/components/Button/Button";
import Modal from "@/UI/components/Modal/Modal";
import Loader from "../Loader/Loader";

import { useAppStore } from "@/UI/lib/zustand/store";
import { useEffect, useState } from "react";

interface CreateApiKeyModal {
  isOpen: boolean;
  onCloseModal: () => void;
  apiPublicKey?: string;
  handleRevoke: () => void;
}

const CreateApiKeyModal = ({ handleRevoke, isOpen, onCloseModal, apiPublicKey: publicKey }: CreateApiKeyModal) => {
  const { ithacaSDK } = useAppStore();
  const [keyGenerationInProgress, setKeyGenerationInProgress] = useState(false);
  const [apiPrivateKey, setApiPrivateKey] = useState<string>();
  const [apiPublicKey, setApiPublicKey] = useState<string>();

  useEffect(() => {
    if (publicKey) {
      setApiPublicKey(publicKey);
    }
  }, [publicKey]);

  useEffect(() => {
    if (isOpen && !publicKey) {
      setKeyGenerationInProgress(true);
    }
  }, [isOpen, publicKey]);

  useEffect(() => {
    if (keyGenerationInProgress) {
      setTimeout(() => {
        handleGenerateApiKey();
      }, 1_000);
    }
  }, [isOpen, publicKey, keyGenerationInProgress]);

  const handleGenerateApiKey = async () => {
    setKeyGenerationInProgress(true);
    try {
      const { privateKey, rsaPublicKey } = await ithacaSDK.auth.linkRSAKey();
      setApiPublicKey(rsaPublicKey);
      setApiPrivateKey(privateKey);
    } catch (error) {
      console.error("Failed to link RSA key", error);
      onCloseModal();
    } finally {
      setKeyGenerationInProgress(false);
    }
  };

  const handleCopy = () => {
    if (apiPublicKey) navigator.clipboard.writeText(apiPublicKey);
  };

  const handleDownload = () => {
    if (apiPrivateKey) {
      const blob = new Blob([apiPrivateKey], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "private-key.pem";
      link.href = url;
      link.click();
    }
  };

  const handleCloseModal = () => {
    setApiPrivateKey(undefined);
    onCloseModal();
  };

  const renderContent = () => {
    if (keyGenerationInProgress) {
      return (
        <div className='tw-my-4 tw-flex tw-items-center tw-justify-center'>
          <Loader type='md' />
        </div>
      );
    }

    if (apiPrivateKey) {
      return (
        <>
          <div>
            <div className='tw-font-lato tw-text-xs tw-text-ithaca-white-60'>API Public Key</div>
            <div className='flex flex-row mt-4'>
              <span className='tw-font-regular tw-flex-[4] tw-overflow-hidden tw-text-ellipsis tw-text-md tw-text-white'>
                {apiPublicKey}
              </span>
              <button
                onClick={handleCopy}
                className='tw-flex-1 tw-cursor-pointer tw-p-1 tw-text-xs tw-font-bold tw-text-ithaca-green-30'
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <div className='tw-font-lato tw-text-xs tw-text-ithaca-white-60'>API Security Key</div>
            <div className='flex flex-row mt-4'>
              <span className='tw-font-regular tw-flex-[4] tw-overflow-hidden tw-text-ellipsis tw-text-md tw-text-white'>
                {`*`.repeat(55)}
              </span>
              <button
                onClick={handleDownload}
                className='tw-flex-1 tw-cursor-pointer tw-p-1 tw-text-xs tw-font-bold tw-text-ithaca-green-30'
              >
                Download
              </button>
            </div>
          </div>
        </>
      );
    }

    return (
      <div>
        <div className='tw-font-lato tw-text-xs tw-text-ithaca-white-60'>Delete API Key to Generate New API Key</div>
        <div className='flex flex-row mt-4'>
          <span className='tw-font-regular tw-flex-[4] tw-overflow-hidden tw-text-ellipsis tw-text-md tw-text-white'>
            {apiPublicKey}
          </span>
          <button
            onClick={handleRevoke}
            className='tw-flex-1 tw-cursor-pointer tw-p-1 tw-text-xs tw-font-bold tw-text-ithaca-red-20'
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} title={apiPublicKey ? "Regenerate API Key" : "Generate API Key"} onCloseModal={onCloseModal}>
      <div className='tw-flex tw-flex-col tw-gap-5'>
        {renderContent()}
        <Button title='close' className='mt-10' onClick={handleCloseModal}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default CreateApiKeyModal;

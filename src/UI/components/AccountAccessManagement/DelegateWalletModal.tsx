import * as Yup from "yup";
import { Field, Form, Formik, FormikHelpers, type FieldInputProps } from "formik";

import Modal from "@/UI/components/Modal/Modal";
import Input from "@/UI/components/Input/Input";
import Button from "@/UI/components/Button/Button";
import Loader from "@/UI/components/Loader/Loader";
import { useAppStore } from "@/UI/lib/zustand/store";
interface DelegateWalletModalProps {
  isOpen: boolean;
  onCloseModal: () => void;
}

export const validationSchema = Yup.object().shape({
  arbitrumWalletAddress: Yup.string().required("Wallet address required"),
});

interface DelegateWalletCreate {
  arbitrumWalletAddress: string;
}

const DelegateWalletModal = ({ isOpen, onCloseModal }: DelegateWalletModalProps) => {
  const { ithacaSDK } = useAppStore();

  const handleSubmit = async (
    values: DelegateWalletCreate,
    { setSubmitting, setFieldError }: FormikHelpers<DelegateWalletCreate>
  ) => {
    setSubmitting(true);
    const nonceResult = await ithacaSDK.wallets.requestLink({ addr: values.arbitrumWalletAddress.toLocaleLowerCase() });
    if (nonceResult.details.length) {
      setFieldError("arbitrumWalletAddress", nonceResult.details);
    } else {
      const result = await ithacaSDK.wallets.confirmLink({ nonce: nonceResult.payload });
      if (result.details.length) {
        setFieldError("arbitrumWalletAddress", result.details);
      } else {
        onCloseModal();
      }
    }

    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} title={"Delegate Wallet"} onCloseModal={onCloseModal}>
      <Formik validationSchema={validationSchema} onSubmit={handleSubmit} initialValues={{ arbitrumWalletAddress: "" }}>
        {({ isValid, dirty, errors, isSubmitting }) => (
          <Form className='tw-flex tw-flex-col tw-gap-7'>
            <div className='flex flex-1'>
              <Field name='arbitrumWalletAddress'>
                {({ field }: { field: FieldInputProps<string> }) => {
                  return (
                    <Input
                      {...field}
                      type='text'
                      hasError={Boolean(errors.arbitrumWalletAddress)}
                      errorMessage={errors.arbitrumWalletAddress}
                      className='tw-w-full'
                      placeholder='Insert Arbitrum wallet address'
                      label='Enter Wallet to Delegate Management Access To'
                    />
                  );
                }}
              </Field>
            </div>
            <Button title='confirm' className='mt-10' type='submit' disabled={!isValid && dirty}>
              {isSubmitting ? <Loader /> : "Confirm"}
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
export default DelegateWalletModal;

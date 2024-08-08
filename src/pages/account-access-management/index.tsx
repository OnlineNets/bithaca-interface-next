import { useAccount } from "wagmi";

// Components
import Meta from "@/UI/components/Meta/Meta";
import Container from "@/UI/layouts/Container/Container";
import Main from "@/UI/layouts/Main/Main";

// Styles
import ApiKeyTable from "@/UI/components/AccountAccessManagement";
import Panel from "@/UI/layouts/Panel/Panel";
// import styles from "./api-management.module.scss";
import DisconnectedWallet from "@/UI/components/DisconnectedWallet/DisconnectedWallet";
import { useAppStore } from "@/UI/lib/zustand/store";

const ApiManagement = () => {
  const { isAuthenticated } = useAppStore();

  return (
    <>
      <Meta />
      <Main>
        <Container className='tw-px-3'>
          <div>
            <h1 className='tw-font-lato tw-text-xl tw-font-medium'>Account Access Management</h1>
            <Panel margin='p-desktop-30 p-mobile-16 p-16'>
              <h3 className='tw-text-md tw-font-semibold'>Manage Access</h3>
              <ApiKeyTable />
              {!isAuthenticated && <DisconnectedWallet />}
            </Panel>
          </div>
        </Container>
      </Main>
    </>
  );
};
export default ApiManagement;

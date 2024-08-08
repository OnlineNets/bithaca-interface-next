import { useState } from "react";
import LocationRestrictedModal from "../LocationRestricted/LocationRestrictedModal";
import styles from "./HideData.module.scss";

interface HideDataProps {
  children: React.ReactNode;
  visible: boolean;
  withModal?: boolean;
  title: string;
}

export const HideData = ({ visible, children, withModal, title }: HideDataProps) => {
  const [showLocationRestrictedModal, setShowLocationRestrictedModal] = useState(false);

  if (!visible) {
    return children;
  }
  return (
    <>
      <LocationRestrictedModal
        isOpen={showLocationRestrictedModal}
        onCloseModal={() => setShowLocationRestrictedModal(false)}
      />
      {withModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>{title}</div>
        </div>
      )}
      <div>
        {!withModal && (
          <div style={{ position: "relative" }}>
            <div className={styles.titleContainer}>
              <button
                onClick={() => setShowLocationRestrictedModal(true)}
                type='button'
                className={styles.locationRestricted}
              >
                Location Restricted
              </button>
            </div>
          </div>
        )}
        <div className={styles.container}>{children}</div>
      </div>
    </>
  );
};

// Packages
import React, { Dispatch, ReactElement, ReactNode, SetStateAction, useCallback, useEffect, useState } from "react";

// Utils
import { getTradingStoryMapper } from "@/UI/utils/TradingStoryMapper";
import { useDevice } from "@/UI/hooks/useDevice";
import { useLastUrlSegment } from "@/UI/hooks/useLastUrlSegment";

// Components
import Toggle from "@/UI/components/Toggle/Toggle";
import TabCardMobile from "./TabCardMobile";
import TabCardDesktop from "./TabCardDesktop";

// Styles
import styles from "./TabCard.module.scss";
import RadioButton from "../RadioButton/RadioButton";
import useMediaQuery from "@/UI/hooks/useMediaQuery";
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from "@/UI/constants/breakpoints";
import classNames from "classnames";

// Types
export type MainTab = {
  id: string;
  title: string | ReactNode;
  selectedTitle?: string;
  description: ReactNode;
  contentId: string;
  radioOptions?: {
    option: string;
    value: string;
  }[];
  underText?: {
    value: string;
    label: string;
  }[];
};

type TabCardProps = {
  className?: string;
  tabs: MainTab[];
  showInstructions: boolean;
  setShowInstructions: Dispatch<SetStateAction<boolean>>;
  tabClassName?: string;
};

const TabCard = ({ className, tabs, showInstructions, setShowInstructions, tabClassName }: TabCardProps) => {
  const device = useDevice();
  const lastSegment = useLastUrlSegment();

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [radioChosen, setRadioChosen] = useState((activeTab.radioOptions && activeTab.radioOptions[0].value) || "");
  const [openOptions, setOpenOptions] = useState<MainTab[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);

  const desktopBreakpoint = useMediaQuery(DESKTOP_BREAKPOINT);
  const tabletBreakpoint = useMediaQuery(TABLET_BREAKPOINT);

  useEffect(() => {
    setRadioChosen((activeTab.radioOptions && activeTab.radioOptions[0].value) || "");
    const options = tabs.filter(tab => tab.id !== activeTab.id);
    setOpenOptions(options);
  }, [activeTab, tabs]);

  useEffect(() => {}, [openOptions, activeDropdown]);

  const getRadioOptionTemplate = useCallback(() => {
    return (activeTab.radioOptions || []).map(({ option, value }, index) => {
      return {
        option: (
          <div className={styles.radioOptionLbl}>
            <>{option}</>
            {getRadioOptionSubTitleTemplate(index)}
          </div>
        ),
        value,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, radioChosen]);

  const getRadioOptionSubTitleTemplate = (index: number) => {
    const isChoosen = radioChosen === activeTab?.underText?.[index].value;
    const shouldRenderUnderText = isChoosen && activeTab.underText && index < activeTab.underText.length;
    return (
      <>
        {shouldRenderUnderText && (
          <span className={`${styles.underTextLabel}`}>{activeTab?.underText?.[index].label}</span>
        )}
      </>
    );
  };

  return (
    <div className={`tabCard--${lastSegment} ${styles.container} ${className}`}>
      {device !== "desktop" ? (
        <TabCardMobile
          activeTab={activeTab}
          activeDropdown={activeDropdown}
          setActiveTab={setActiveTab}
          tabClassName={tabClassName}
          setActiveDropdown={setActiveDropdown}
          openOptions={openOptions}
        />
      ) : (
        <TabCardDesktop tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} tabClassName={tabClassName} />
      )}
      <div className={classNames(`tabCard--${activeTab.id}`, styles.rightPanel, "tw-flex tw-flex-col")}>
        <div
          className={`rightPanelHeader--${activeTab.id} ${styles.rightPanelHeader} ${
            activeTab.underText?.length ? `${styles.hasSubtitles}` : ""
          }`}
        >
          {activeTab.id !== "earn" && activeTab.id !== "bonusTwinWin" ? (
            <h2>{activeTab.selectedTitle || activeTab.title}</h2>
          ) : device !== "phone" ? (
            <RadioButton
              size='large'
              options={getRadioOptionTemplate()}
              selectedOption={radioChosen}
              name={`${activeTab.id}-type`}
              onChange={setRadioChosen}
              width={300}
            />
          ) : (
            <div className='mb-12 full-width'>
              <RadioButton
                size='large'
                options={getRadioOptionTemplate()}
                selectedOption={radioChosen}
                name={`${activeTab.id}-type`}
                onChange={setRadioChosen}
                width={300}
              />
            </div>
          )}

          <div
            className={`${styles.toggleWrapper} ${
              activeTab.id !== "earn" && activeTab.id !== "bonusTwinWin" ? "" : `${styles.earnOrBonus}`
            }}`}
          >
            <Toggle
              size='sm'
              defaultState={showInstructions ? "right" : "left"}
              rightLabel='Description'
              rightLabelClass='white-80 font-bold'
              onChange={() => setShowInstructions(!showInstructions)}
            />
          </div>
        </div>
        {getTradingStoryMapper(
          activeTab.contentId,
          showInstructions,
          false,
          radioChosen,
          undefined,
          desktopBreakpoint,
          tabletBreakpoint
        )}
      </div>
    </div>
  );
};

export default TabCard;

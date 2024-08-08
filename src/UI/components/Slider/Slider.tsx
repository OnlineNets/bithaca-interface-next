// Packages
import { useEffect, useState, ChangeEvent, useRef } from "react";

// Utils
import { checkValidMinMaxValue, generateLabelList, stepArray } from "@/UI/utils/SliderUtil";
import { useLastUrlSegment } from "@/UI/hooks/useLastUrlSegment";

//Style
import styles from "./Slider.module.scss";

// Types
type ValueProps = {
  min: number;
  max: number;
};

type SliderProps = {
  value?: ValueProps;
  min: number;
  max: number;
  step?: number;
  range?: boolean;
  extended?: boolean;
  label?: number;
  showLabel?: boolean;
  title?: string;
  lockFirst?: boolean;
  onChange?: (value: ValueProps) => void;
};

const Slider = ({
  value,
  min,
  max,
  step = 1,
  range = false,
  label = 2,
  showLabel = true,
  onChange,
  extended = false,
  lockFirst = false,
}: SliderProps) => {
  const lastSegment = useLastUrlSegment();
  const [minValue, setMinValue] = useState<number>(range ? (value ? value.min : min) : min);
  const [maxValue, setMaxValue] = useState<number>(value ? value.max : min);
  const [minPos, setMinPos] = useState<number>(0);
  const [maxPos, setMaxPos] = useState<number>(0);
  const labelList = generateLabelList(min, max, label);
  const stepList = stepArray(min, max, step);
  const controlWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinPos(range ? ((minValue - min) / (max - min)) * 100 : 0);
    setMaxPos(((maxValue - min) / (max - min)) * 100);
  }, [maxValue, minValue, min, max, range]);

  useEffect(() => {
    setMinValue(value?.min || min);
    setMaxValue(value?.max || max);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(+e.target.value, maxValue);
    if (lockFirst && newMinVal === min) {
      setMinValue(stepList[1]);
      if (onChange) onChange({ min: stepList[1], max: maxValue });
    } else if (newMinVal < maxValue) {
      setMinValue(newMinVal);
      if (onChange) onChange({ min: newMinVal, max: maxValue });
    }
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(+e.target.value, minValue);
    if (lockFirst && newMaxVal === min) {
      setMinValue(stepList[1]);
      if (onChange) onChange({ min: minValue, max: stepList[1] });
    } else if (newMaxVal > minValue) {
      setMaxValue(newMaxVal);
      if (onChange) onChange({ min: minValue, max: newMaxVal });
    }
  };

  const getLabelClassName = (item: number) => {
    const classList = [styles.labelItem];

    if (range) {
      if (item >= minValue && item <= maxValue) {
        classList.push(styles.highlight);
      }
    } else if (item == maxValue) {
      classList.push(styles.highlight);
    }
    return classList.join(" ");
  };

  const setMinMaxValue = (item: number) => {
    if (!range) {
      if (lockFirst && item === min) {
        if (onChange) onChange({ min: minValue, max: stepList[1] });
        setMaxValue(stepList[1]);
      } else {
        setMaxValue(item);
        if (onChange) onChange({ min: minValue, max: item });
      }
    } else {
      const betweenVal = minValue + (maxValue - minValue) / 2;
      if (item > maxValue) {
        setMaxValue(item);
        if (onChange) onChange({ min: minValue, max: item });
      } else if (item < minValue) {
        setMinValue(item);
        if (onChange) onChange({ min: item, max: maxValue });
      } else if (betweenVal < item) {
        setMaxValue(item);
        if (onChange) onChange({ min: minValue, max: item });
      } else if (betweenVal >= item) {
        setMinValue(item);
        if (onChange) onChange({ min: item, max: maxValue });
      }
    }
  };

  const getValuePosition = (event: React.MouseEvent) => {
    const offsetX = event.nativeEvent.offsetX;
    const width = event.currentTarget.clientWidth;
    const value = min + Math.round(((max - min) / width) * offsetX);
    const className = event.currentTarget.className;
    if (
      className.includes("Slider_innerRail") ||
      className.includes("Slider_rail") ||
      className.includes("Slider_controlWrapper")
    ) {
      if (range) {
        if (controlWrapperRef.current) {
          const rect = controlWrapperRef.current.getBoundingClientRect();
          const distanceFromXAxis = rect.left;
          const cursorPoint = event.clientX - distanceFromXAxis;
          const offestPosition = (width / 100) * minPos + offsetX;
          if (cursorPoint < (width / 100) * minPos) {
            setMinValue(checkValidMinMaxValue(stepList, value));
            if (onChange) onChange({ min: checkValidMinMaxValue(stepList, value), max: maxValue });
          } else if (cursorPoint > (width / 100) * maxPos) {
            setMaxValue(checkValidMinMaxValue(stepList, value));
            if (onChange) onChange({ min: minValue, max: checkValidMinMaxValue(stepList, value) });
          } else {
            const rangeItemValue = min + Math.round(((max - min) / width) * offestPosition);
            const betweenVal = minValue + (maxValue - minValue) / 2;
            if (rangeItemValue > maxValue) {
              setMaxValue(checkValidMinMaxValue(stepList, rangeItemValue));
              if (onChange) onChange({ min: minValue, max: checkValidMinMaxValue(stepList, rangeItemValue) });
            } else if (rangeItemValue < minValue) {
              setMinValue(checkValidMinMaxValue(stepList, rangeItemValue));
              if (onChange) onChange({ min: checkValidMinMaxValue(stepList, rangeItemValue), max: maxValue });
            } else if (betweenVal < rangeItemValue) {
              setMaxValue(checkValidMinMaxValue(stepList, rangeItemValue));
              if (onChange) onChange({ min: minValue, max: checkValidMinMaxValue(stepList, rangeItemValue) });
            } else if (betweenVal >= rangeItemValue) {
              setMinValue(checkValidMinMaxValue(stepList, rangeItemValue));
              if (onChange) onChange({ min: checkValidMinMaxValue(stepList, rangeItemValue), max: maxValue });
            }
          }
        }
      } else {
        const validValue = checkValidMinMaxValue(stepList, value);
        if (lockFirst && validValue === min) {
          setMaxValue(stepList[1]);
          if (onChange) onChange({ min: minValue, max: stepList[1] });
        } else {
          setMaxValue(validValue);
          if (onChange) onChange({ min: minValue, max: validValue });
        }
      }
    } else {
      if (range) {
        if (value > maxValue) {
          if (onChange) onChange({ min: minValue, max: checkValidMinMaxValue(stepList, value) });
          setMaxValue(checkValidMinMaxValue(stepList, value));
        } else if (value < minValue) {
          setMinValue(checkValidMinMaxValue(stepList, value));
        } else {
          const betweenVal = minValue + (maxValue - minValue) / 2;
          if (value >= betweenVal) {
            setMaxValue(checkValidMinMaxValue(stepList, value));
            if (onChange) onChange({ min: minValue, max: checkValidMinMaxValue(stepList, value) });
          } else {
            setMinValue(checkValidMinMaxValue(stepList, value));
            if (onChange) onChange({ min: checkValidMinMaxValue(stepList, value), max: maxValue });
          }
        }
      } else {
        const validValue = checkValidMinMaxValue(stepList, value);
        if (lockFirst && validValue === min) {
          setMaxValue(stepList[1]);
          if (onChange) onChange({ min: minValue, max: stepList[1] });
        } else {
          setMaxValue(validValue);
          if (onChange) onChange({ min: minValue, max: validValue });
        }
      }
    }
  };

  return (
    <div
      className={`slider--${lastSegment} ${
        showLabel
          ? extended
            ? range
              ? styles.containerExtendRange
              : styles.containerExtend
            : styles.container
          : styles.containerNoLabels
      }`}
    >
      <div className={styles.inputWrapper}>
        <input
          className={`${styles.input} ${!range ? styles.hide : ""}`}
          type='range'
          value={minValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMinChange}
        />
        <input
          className={styles.input}
          type='range'
          value={maxValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMaxChange}
        />
      </div>
      <div className={styles.sliderEffect} onClick={event => getValuePosition(event)}></div>
      <div className={styles.controlWrapper} onClick={event => getValuePosition(event)} ref={controlWrapperRef}>
        <div className={`${styles.control} ${!range ? styles.hide : ""}`} style={{ left: `${minPos}%` }} />
        {extended && range && <div className={styles.railExtendRange}></div>}
        {extended && !range && <div className={styles.railExtend}></div>}
        <div className={styles.rail}>
          <div className={styles.innerRail} style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }} />
        </div>
        <div className={styles.control} style={{ left: `${maxPos}%` }} />
      </div>

      <div className={`labelContainer--${lastSegment} ${styles.labelContainer} ${!showLabel ? styles.hide : ""}`}>
        {labelList.map((item: number, idx: number) => {
          return !lockFirst || idx ? (
            <div
              key={idx}
              className={`${lockFirst && !idx ? styles.hide : ""} ${getLabelClassName(item)}`}
              style={{
                left:
                  idx != 0
                    ? idx != labelList.length - 1
                      ? `calc(${idx * (100 / (label - 1)) + "%"} - 10px)`
                      : `calc(${idx * (100 / (label - 1)) + "%"} - 22px)`
                    : `calc(${idx * (100 / (label - 1)) + "%"})`,
              }}
              onClick={() => setMinMaxValue(item)}
            >
              {item}
            </div>
          ) : (
            <></>
          );
        })}
      </div>
    </div>
  );
};

export default Slider;

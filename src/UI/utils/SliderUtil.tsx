export const generateLabelList = (start: number, end: number, numParts: number): number[] => {
  const step = Math.floor((end - start) / (numParts - 1));
  return Array.from({ length: numParts }, (_, i) => start + i * step);
};

export const stepArray = (min: number, max: number, step: number): number[] => {
  const result = [];
  for (let i = min; i <= max; i += step) {
    result.push(i);
  }
  return result;
};

export const checkValidMinMaxValue = (stepList: number[], checkingVal: number) => {
  let result = 0;
  for (let i = 0; i < stepList.length - 1; i++) {
    if (stepList[i] <= checkingVal && stepList[i + 1] >= checkingVal) {
      const midValue = (stepList[i + 1] - stepList[i]) / 2;
      if (checkingVal >= midValue + stepList[i]) {
        result = stepList[i + 1];
      } else {
        result = stepList[i];
      }
    }
  }
  return result;
};

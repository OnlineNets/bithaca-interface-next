import { HandlePointsErrorProps } from "@/UI/constants/pointsProgram";
import Decimal from "decimal.js";

interface ImageCache {
  [key: string]: boolean;
}

// Fix rounding issues with Decimal.js library by setting rounding mode to ROUND_HALF_UP
Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export const getTruncateEthAddress = (username: string | number, currentUserId?: number, id: number = 0): string => {
  let showingUsername = (username = username.toString().replace(/\s/g, ""));
  if (showingUsername.length >= 42) {
    const firstPart = username.slice(0, 4);
    const lastPart = username.slice(-4);
    showingUsername = firstPart + "..." + lastPart;
  }
  const lengthCheck = currentUserId && currentUserId.toString().length && id.toString().length;
  return lengthCheck && currentUserId === id ? showingUsername + " (You)" : showingUsername;
};

export const formatNumber = (value: number | string, decimal: number = 5): string => {
  const decimalValue = new Decimal(value);
  const roundedValue = decimalValue.toFixed(decimal);

  if (roundedValue.includes("e")) {
    return fixNumber(decimalValue, decimal);
  } else {
    const parts = roundedValue.split(".");
    if (parts.length === 2 && parts[1].length > decimal) {
      return fixNumber(decimalValue, decimal);
    } else {
      if (decimalValue.gte(1000000)) {
        return decimalValue.div(1000000).toFixed(1) + "m";
      } else if (decimalValue.gte(1000)) {
        return decimalValue.div(1000).toFixed(1) + "k";
      } else {
        return roundedValue;
      }
    }
  }
};

export const formatPoints = (points: number, type: "All" | "Withdrawal" | "Earn"): string => {
  const formattedPoints = formatNumber(points, 2);
  switch (type) {
    case "Withdrawal":
      return `-${formattedPoints} pts`;
    case "Earn":
      return `+${formattedPoints} pts`;
    case "All":
    default:
      return `${formattedPoints} pts`;
  }
};

export const fixNumber = (number: Decimal, decimal: number = 5): string => {
  const regexString = `^-?\\d+(?:\\.\\d{0,${decimal}})?`;
  const string = number.toString();
  const match = string.match(regexString);

  if (match && new Decimal(match[0]).lte(number)) {
    return match[0].toString();
  } else {
    return number.toFixed(decimal);
  }
};

export const handlePointsError = ({ showToast, title, message }: HandlePointsErrorProps) => {
  showToast(
    {
      id: new Date().getTime(),
      title: title,
      message: message,
      type: "info",
    },
    "bottom-right"
  );
};

export const isValidImage = (imagePath: string): Promise<boolean> => {
  if (isValidImage.cache && isValidImage.cache[imagePath] !== undefined) {
    return Promise.resolve(isValidImage.cache[imagePath]);
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onload = function () {
      if (!isValidImage.cache) isValidImage.cache = {};
      isValidImage.cache[imagePath] = true;
      resolve(true);
    };
    img.onerror = function () {
      if (!isValidImage.cache) isValidImage.cache = {};
      isValidImage.cache[imagePath] = false;
      resolve(false);
    };
    img.src = imagePath;
  });
};

isValidImage.cache = {} as ImageCache;

type OpenCentredPopupProps = {
  url: string;
  width: number;
  height: number;
};

export const openCentredPopup = ({ url, width, height }: OpenCentredPopupProps) => {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const w = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const h = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const systemZoom = w / window.screen.availWidth;
  const left = (w - width) / 2 / systemZoom + dualScreenLeft;
  const top = (h - height) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(
    url,
    "_blank",
    `
      scrollbars=yes,
      resizable=yes,
      toolbar=no,
      location=yes,
      width=${width / systemZoom}, 
      height=${height / systemZoom}, 
      top=${top}, 
      left=${left}
      `
  );

  if (newWindow) newWindow.focus();
};

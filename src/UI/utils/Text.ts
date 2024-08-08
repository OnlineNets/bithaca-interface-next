export const maskString = (str: string) => {
  if (str.length <= 2) {
    return str;
  } else if (str.length <= 8) {
    return `${str[0]}...${str[str.length - 1]}`; // Leave the first and last character if the string is shorter than 8 characters
  }
  const start = str.slice(0, 4);
  const end = str.slice(-4);
  const masked = `${start}...${end}`;
  return masked;
};

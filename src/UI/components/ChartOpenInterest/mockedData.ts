// + = long
// - = short
type Data = {
  name: string;
  type: string;
};

export const getColor = (data: Data): string => {
  switch (data.name) {
    case "Forward":
      return data.type === "long" ? "#BDA5D3" : "#9637F1";
    case "Put":
      return data.type === "long" ? "#E38A95" : "#FF3F57";
    case "Call":
      return data.type === "long" ? "#97E8B7" : "#4BB475";
    case "Binary Call":
    case "Digital Call":
      return data.type === "long" ? "#18B5B5" : "#9DDFDF";
    case "Binary Put":
    case "Digital Put":
      return data.type === "long" ? "#FF762A" : "#D5B09B";
    default:
      return "#000000";
  }
};

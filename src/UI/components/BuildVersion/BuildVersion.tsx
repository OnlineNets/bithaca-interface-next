import { useEffect } from "react";

type BuildVersion = {
  className?: string;
};

function BuildVersion({ className }: Readonly<BuildVersion>) {
  const version = process.env.NEXT_PUBLIC_BUILD_ID;

  useEffect(() => {
    console.log("Current version:", version);
  }, []);

  if (!version || version.includes("github")) return null;

  return <span className={className}>Version: {version.slice(0, 6)}</span>;
}

export default BuildVersion;

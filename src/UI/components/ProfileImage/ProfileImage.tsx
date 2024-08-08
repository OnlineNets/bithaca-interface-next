import { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

// Components
import Avatar from "@/UI/components/Icons/Avatar";

// Utils
import { isValidImage } from "@/UI/utils/Points";

const ProfileImage = (props: ImageProps) => {
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    isValidImage(props.src as string).then(result => {
      setIsValid(result);
    });
  }, [props.src]);

  // eslint-disable-next-line jsx-a11y/alt-text
  return isValid ? <Image {...props} /> : <Avatar />;
};

export default ProfileImage;

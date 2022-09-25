import { toSvg } from "jdenticon";
import { ImgHTMLAttributes } from "react";

type GeneratedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  readonly generateSource: any;
  readonly generateSize: number;
};

const GeneratedImage = (props: GeneratedImageProps) => {
  const { generateSource, generateSize, ...imgProps } = props;
  const image = encodeURIComponent(toSvg(generateSource, generateSize));
  return <img src={`data:image/svg+xml;utf8,${image}`} {...imgProps} />;
};

export default GeneratedImage;

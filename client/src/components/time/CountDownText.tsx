import { useEffect, useState } from "react";

type CountDownTextProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
> & {
  countDownDurationSeconds: number;
  digits: number;
  pollIntervalMilliseconds: number;
};

const CountDownText = ({
  countDownDurationSeconds,
  digits,
  pollIntervalMilliseconds,
  ...spanProps
}: CountDownTextProps) => {
  const [timeRemaining, setTimeRemaining] = useState(
    countDownDurationSeconds * 1000
  );

  useEffect(() => {
    const intervalId = setInterval(
      () =>
        setTimeRemaining((prevTime) => {
          return Math.max(prevTime - pollIntervalMilliseconds, 0);
        }),
      pollIntervalMilliseconds
    );
    return () => clearInterval(intervalId);
  }, [pollIntervalMilliseconds]);

  return <span {...spanProps}>{(timeRemaining / 1000).toFixed(digits)}s</span>;
};

export default CountDownText;

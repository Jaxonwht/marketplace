import { notification } from "antd";
import CountDownText from "../time/CountDownText";

export const promptSignIn = (
  autoCloseDuration: number,
  onCloseCallback?: () => void
) => {
  notification["warn"]({
    message: "Please sign in to AISSI again.",
    description: (
      <span>
        Will redirect to homepage in{" "}
        <CountDownText
          countDownDurationSeconds={autoCloseDuration}
          digits={0}
          pollIntervalMilliseconds={1000}
        />
        . Click or this notification to immediately redirect.
      </span>
    ),
    duration: autoCloseDuration,
    onClose: onCloseCallback,
    onClick: onCloseCallback,
  });
};

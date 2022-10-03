// setInterval only runs the first invocation after the first interval.
// This util function makes sure the first invocation happens immediately.
export const callAndSetInterval = (
  func: () => any,
  refreshPeriodMs: number
) => {
  func();
  const intervalId = setInterval(func, refreshPeriodMs);
  return () => clearInterval(intervalId);
};

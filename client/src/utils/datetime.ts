import moment from "moment";
export const utcStringToLocalShort = (utcTime: string) =>
  moment.utc(utcTime).local().format("YYYY-MM-DD HH:mm:ss");

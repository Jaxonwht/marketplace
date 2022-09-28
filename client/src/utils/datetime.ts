import moment from "moment";

export const utcStringToLocalMoment = (utcTime: string) =>
  moment.utc(utcTime).local();

export const utcStringToLocalShort = (utcTime: string) =>
  utcStringToLocalMoment(utcTime).format("YYYY-MM-DD HH:mm:ss");

export const utcStringToLocalShortISO = (utcTime: string) =>
  utcStringToLocalMoment(utcTime).format("YYYY-MM-DDTHH:mm:ss");

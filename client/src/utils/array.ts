export const reduceByField = <T, K extends keyof T, V>(
  array: T[],
  key: K,
  reduceFn: (initialValue: V, b: T[K]) => V,
  initialValue: V
): V => array.map((item) => item[key]).reduce(reduceFn, initialValue);

export const listRequestArg = (requestArgKey: string, values: any[]) =>
  values.map((v) => `${requestArgKey}=${v}`).join("&");

export function get_thousand_num(num) {
  return num.toString().replace(/\d+/, function (n) {
    // 先提取整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
      // 对整数部分添加分隔符
      return $1 + ",";
    });
  });
}

export const isMobile = () => {
  var userAgentInfo = navigator.userAgent;

  var Agents = [
    "Android",
    "iPhone",

    "SymbianOS",
    "Windows Phone",

    "iPad",
    "iPod",
  ];

  var flagPc = true;

  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flagPc = false;

      break;
    }
  }

  return !flagPc;
};

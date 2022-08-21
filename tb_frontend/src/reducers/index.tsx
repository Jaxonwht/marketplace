import { combineReducers } from "redux";

const isMobileReducer = (state = false, action: any) => {
  switch (action.type) {
    case "SETISMOBILE":
      return action.payload.isMobile;
    default:
      return state;
  }
};

const themeReducer = (state = "Light", action: any) => {
  switch (action.type) {
    case "SETTHEME":
      return action.payload.theme;
    default:
      return state;
  }
};

// 组合reducers
export default combineReducers({
  isMobile: isMobileReducer,
  theme: themeReducer,
});

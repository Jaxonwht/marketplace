import { configureStore } from "@reduxjs/toolkit";
import identityReducer from "../reduxSlices/identitySlice";
import themeReducer from "../reduxSlices/themeSlice";
import isMobileReducer from "../reduxSlices/mobileSlice";
import balanceReducer from "../reduxSlices/balanceSlice";
import bakcendConfigReducer from "../reduxSlices/backendConfigSlice";
import dealInfoReducer from "../reduxSlices/dealInfoSlice";

const store = configureStore({
  reducer: {
    identity: identityReducer,
    theme: themeReducer,
    isMobile: isMobileReducer,
    balance: balanceReducer,
    backendConfig: bakcendConfigReducer,
    dealInfo: dealInfoReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type GetRootState = typeof store.getState;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;

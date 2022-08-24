import type { AppDispatch, RootState } from "./";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

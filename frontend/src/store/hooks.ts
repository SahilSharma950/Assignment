import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed dispatch hook — use this instead of plain `useDispatch`.
 * Provides full type inference for thunks and actions.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Typed selector hook — use this instead of plain `useSelector`.
 * Provides full type inference from RootState.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

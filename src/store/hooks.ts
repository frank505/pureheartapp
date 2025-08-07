/**
 * Redux Typed Hooks
 * 
 * This file provides pre-typed versions of React Redux hooks.
 * These hooks include proper TypeScript types for our specific store structure.
 * 
 * Using these typed hooks instead of the generic ones provides:
 * - Better TypeScript IntelliSense
 * - Compile-time type checking
 * - Reduced boilerplate in components
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed useDispatch Hook
 * 
 * Use this instead of plain `useDispatch` to get proper TypeScript support
 * for all our Redux actions and thunks.
 * 
 * Example usage:
 * ```tsx
 * const dispatch = useAppDispatch();
 * dispatch(fetchPosts()); // Fully typed!
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector Hook
 * 
 * Use this instead of plain `useSelector` to get proper TypeScript support
 * for accessing state with autocomplete and type checking.
 * 
 * Example usage:
 * ```tsx
 * const user = useAppSelector(state => state.user); // Fully typed!
 * const isLoading = useAppSelector(state => state.posts.loading);
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// lib/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux'
import { RootState, AppDispatch, AppStore } from '@/lib/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch()
export const useAppSelector = useSelector()
export const useAppStore = useStore()
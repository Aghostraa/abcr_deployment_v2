import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarStore = {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
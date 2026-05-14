import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, PrintDesign } from '@/types';

interface ConfiguratorState {
  selectedProduct: Product | null;
  selectedPrint: PrintDesign | null;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedPrint: (print: PrintDesign | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set) => ({
      selectedProduct: null,
      selectedPrint: null,
      _hasHydrated: false,
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedPrint: (print) => set({ selectedPrint: print }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'art-lavka-configurator',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

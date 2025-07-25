import { create } from 'zustand';

export default create((set) => ({
  activeDomain: 'economy',
  setActiveDomain: (domain) => set({ activeDomain: domain }),
  selectedYear: 2023,
  setSelectedYear: (year) => set({ selectedYear: year }),
}));

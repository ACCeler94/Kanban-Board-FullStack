import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Board {
  title: string;
  id: string;
}

type State = {
  activeBoard: Board | null;
};

type Actions = {
  setActiveBoard: (board: Board | null) => void;
};

const useStore = create<State & Actions>()(
  devtools((set) => ({
    // Initial state
    activeBoard: null,

    // Actions
    setActiveBoard: (board: Board | null) => set({ activeBoard: board }),
  }))
);

export default useStore;

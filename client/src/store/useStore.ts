import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Board {
  title: string;
  id: string;
}

type State = {
  activeBoard: Board | null;
  subtasksToRemove: string[] | [];
};

type Actions = {
  setActiveBoard: (board: Board | null) => void;
  setSubtasksToRemove: (ids: string[] | []) => void;
};

const useStore = create<State & Actions>()(
  devtools((set) => ({
    // Initial state
    activeBoard: null,
    subtasksToRemove: [],

    // Actions
    setActiveBoard: (board: Board | null) => set({ activeBoard: board }),
    setSubtasksToRemove: (ids: string[] | []) => set({ subtasksToRemove: ids }),
  }))
);

export default useStore;

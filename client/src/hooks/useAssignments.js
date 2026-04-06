import { useApp } from '../context/AppContext';

export function useAssignments() {
  const { assignments, setAssignments } = useApp();
  return { assignments, setAssignments };
}

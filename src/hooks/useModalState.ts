import { useState, useCallback } from "react";

export interface ModalState {
  [key: string]: boolean;
}

export function useModalState(initialState: ModalState = {}) {
  const [modals, setModals] = useState<ModalState>(initialState);

  const openModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }, []);

  const toggleModal = useCallback((modalName: string) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      const newState: ModalState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isOpen: (modalName: string) => modals[modalName] || false,
  };
}

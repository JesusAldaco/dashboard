import { set } from "react-hook-form"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarStore {
  isOpen: boolean // Estado para controlar si el sidebar está abierto o cerrado
  expandedSection: Record<string, boolean> // Estado para controlar que acciones estan expandidas
  toggleSidebar: () => void //Funcion para alternar todo el sidebar
  toggleSection: (key: string) => void // Función para alternar una sección especifica
  setSectionOpen: (key: string, value: boolean) => void // Función para establecer el etado de una sección 
}

export const useSidebarStore = create (
  persist<SidebarStore>(
    (set) => ({
      isOpen: true,
      expandedSection: {},
      toggleSidebar: () => 
        set((state) => ({
          isOpen: !state.isOpen
        })),
      toggleSection: (key) =>
        set((state) => ({
          expandedSection: {
            ...state.expandedSection,
            [key]: !state.expandedSection[key]
          }
        })),
      setSectionOpen: (key: string, isOpen: boolean) =>
        set((state) => ({
          expandedSection: {
            ...state.expandedSection,
            [key]: isOpen
          }
        }))
    }),
    {
        name: "sidebar-store"
    }
  )
)
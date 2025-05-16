import { set } from "react-hook-form"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface BreadcrumbItem {
    label: string
    href?: string
    isCurrentPage: boolean
}

interface BreadcrumbSote {
    items: BreadcrumbItem[]
    setItems: (items: BreadcrumbItem[]) => void // Funcion para configurar el breadcrum basado en una ruta
    setBreadcrum: (path: string) => void
}

// Mapa de rutas para configurar el breadcrum basado en la ruta actual
const routeMap: Record<string, BreadcrumbItem[]> = {
    '/': [
        { label: 'Inicio', href: '/', isCurrentPage: true }
    ],
    '/maestros': [
        { label: 'Inicio', href: '/' },
        { label: 'Maestros', href: '/maestros', isCurrentPage: true }
    ],
    '/maestros/create': [
        { label: 'Inicio', href: '/' },
        { label: 'Maestros', href: '/maestros' },
        { label: 'Crear', isCurrentPage: true }
    ],
    '/estudiantes': [
        { label: 'Inicio', href: '/' },
        { label: 'Estudiantes', href: '/estudiantes', isCurrentPage: true }
    ],
    '/estudiantes/create': [
        { label: 'Inicio', href: '/' },
        { label: 'Estudiantes', href: '/estudiantes' },
        { label: 'Crear', isCurrentPage: true }
    ],
    '/materias': [
        { label: 'Inicio', href: '/' },
        { label: 'Materias', href: '/materias', isCurrentPage: true }
    ],
    '/materias/create': [
        { label: 'Inicio', href: '/' },
        { label: 'Materias', href: '/materias' },
        { label: 'Crear', isCurrentPage: true }
    ],
    '/salones': [
        { label: 'Inicio', href: '/' },
        { label: 'Salones', href: '/Salones', isCurrentPage: true }
    ],
    '/salones/create': [
        { label: 'Inicio', href: '/' },
        { label: 'Salones', href: '/salones' },
        { label: 'Crear', isCurrentPage: true }
    ],
    '/horarios': [
        { label: 'Inicio', href: '/' },
        { label: 'Horarios', href: '/horarios', isCurrentPage: true }
    ],
    '/horarios/create': [
        { label: 'Inicio', href: '/' },
        { label: 'Horarios', href: '/horarios' },
        { label: 'Crear', isCurrentPage: true }
    ],
}

export const useBreadcrumbStore = create(
    persist<BreadcrumbSote>(
        (set) => ({
            items: [{ label: 'Inicio', href: '/', isCurrentPage: true }],
            setItems: (items) => set({ items}),
            setBreadcrum: (path) => {
                // Si la ruta existe en el mapa, establecemos estos items
                if (routeMap[path]){
                    set({ items: routeMap[path] })
                }else{
                    // Si no exsite creamos un breadcrumb básico
                    const pathSegment = path.split('/').filter(Boolean)
                    const breadcrumbItems: BreadcrumbItem[] = [
                        { label: 'Inicio', href: '/' }
                    ]

                    let currentPath = ''
                    pathSegment.forEach((segment, index) => {
                        currentPath += `/${segment}`
                        const isLast = index === pathSegment.length - 1
                        breadcrumbItems.push({
                            label: segment.charAt(0).toUpperCase() + segment.slice(1),
                            href: isLast ? undefined : currentPath,
                            isCurrentPage: isLast
                        })
                    })

                    set({ items: breadcrumbItems})
                }
            }
        }),
        {
            name: "breadcrum"
        }
    )
)
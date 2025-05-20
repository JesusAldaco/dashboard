'use client'

import { useConvex, useMutation, } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useMemo, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import { ColDef, ICellRendererParams, ModuleRegistry, AllCommunityModule, RowSelectionOptions } from "ag-grid-community"
import { Id } from "@/convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchQuery } from "convex/nextjs"

// Registrar los modulos de AG Grid
ModuleRegistry.registerModules([AllCommunityModule])

// Tipo para la estructura de datos de calificaciones
interface Calificacion {
    _id: Id<"calificaciones">
    estudianteID: Id<"estudiantes">
    materiaID: Id<"materias">
    nota: number
    semestre: string
    estudiante: {
        id: Id<"estudiantes">
        nombre: string
        numMatricula: string
    } | null
    materia: {
        id: Id<"materias">
        nombreMateria: string
        identificador: string
    } | null
}

// Comoponente para renerizar botones de accion
const AccionesRender = (props: ICellRendererParams<Calificacion>) => {
    const eliminarCalificacion = useMutation(api.calificaciones.eliminarCalificacion)
    const router = useRouter()
    const [modalEliminar, setModalEliminar] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const onEliminar = async () => {
        try{
          setIsDeleting(true)
          if (!props.data) return
          await eliminarCalificacion({ id: props.data._id })
          setModalEliminar(false)
          // router.refresh()
        } catch(error){
          console.error("Error al eliminar calificación: ", error)
          alert("Error al eliminar calificación")
        }finally{
          setIsDeleting(false)
        }
    }

    const onEditar = (e: React.MouseEvent) => {
      e.stopPropagation()
      if(!props.data) return
      router.push(`/calificaciones/${props.data._id}`)
    }

    const onClickEliminar = (e: React.MouseEvent) => {
      e.stopPropagation()
      setModalEliminar(true)
    }

    return (
      <div className="flex gap-2" onClick={(e) => e.stopPropagation}>
        <Button
          variant="outline"
          size="sm"
          className="p-1 h-8 w-8"
          onClick={onEditar}
        >
          <Edit className="h-4 w-4"/>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="p-1 h-8 w-8 text-destructive hover:bg-destructive/10"
          onClick={onClickEliminar}
        >
          <Trash2 className="h-4 w-4"/>
        </Button>
        {/* Modal de confirmación para eliminar */}
        <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>¿Estás completamente seguro?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. La calificación será eliminada permanentemente de la base de datos
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setModalEliminar(false)
                }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onEliminar()
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar" }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
}

export function TablaCalificaciones(){
  const router = useRouter()
  const convex = useConvex()
  const [calificaciones, setCalificaciones] = useState<Calificacion[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try{
      const data = await convex.query(api.calificaciones.obtenerCalificaciones)
      console.log(data)
      setCalificaciones(data)
    }catch(err){
      setError("Failed to fetch data")
      console.error("Failed to fetch initial data", err)
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() =>{
    if (convex){
      fetchData()
    }
  }, [convex])

  // Definición de columna para AG Grid
  const columnDefs = useMemo<ColDef<Calificacion>[]>(() => [
    {
      headerName: "Matricula",
      field: "estudiante.numMatricula",
      sortable: true,
      filter: true,
      flex: 1
    },
    {
      headerName: "Estudiante",
      field: "estudiante.nombre",
      sortable: true,
      filter: true,
      flex: 2
    },
    {
      headerName: "Materia",
      field: "materia.nombreMateria",
      sortable: true,
      filter: true,
      flex: 2
    },
    {
      headerName: "Clave",
      field: "materia.identificador",
      sortable: true,
      filter: true,
      flex: 1
    },
    {
      headerName: "Nota",
      field: "nota",
      sortable: true,
      filter: true,
      cellStyle: (params) => {
        if (params.value < 6) return { color: 'red' }
        else if (params.value >= 9) return { color: 'green' }
        return null
      },
      flex: 1
    },
    {
      headerName: "Semestre",
      field: "semestre",
      sortable: true,
      filter: true,
      flex: 1
    },
    {
      headerName: "Acciones",
      field: "_id",
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: AccionesRender,
      cellStyle: { padding: '2px' },
      suppressNavigable: true,
      suppressCellSelection: true
    },
  ], [])

  const rowSelection = useMemo<RowSelectionOptions | "single" | "multiple">(() => {
    return {
      mode: "singleRow",
    };
  }, []);

  // Configuración por defecto de AG Grid
  const defaultColDef = useMemo(() => ({
    resizable: true
  }), [])

  const handleCrear = () => {
    router.push("/calificaciones/create")
  }

  if (isLoading){
    return <div>Cargando calificaciones...</div>
  }

  if (error) {
    return <div>Error en la carga de las calificaciones: {error}</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de calificaciones</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4"/>
          Nueva Calificación
        </Button>
      </div>
      <div className="w-full h-[500px]">
        <AgGridReact 
          rowData={calificaciones}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
           paginationPageSizeSelector={[10, 20, 50, 100]} // ← aquí el cambio
          animateRows={true}
          rowSelection={rowSelection}
        />
      </div>
    </>
  )
}
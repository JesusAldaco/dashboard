'use client'

import { use, useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { tree } from "next/dist/build/templates/app-page"

export default function DetalleCalificacionPage({params}:{params:Promise<{ id: string }>}){
  const { id } = use(params)
  const idCalificaciones = id as Id<"calificaciones">
  const router = useRouter()
  const calificacion = useQuery(api.calificaciones.obtenerCalificacionesByID, {id: idCalificaciones} )
  const eliminarCalificacion = useMutation(api.calificaciones.eliminarCalificacion)

  const [modalEliminar, setModalEliminar] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (calificacion === undefined){
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4"/>
            <Skeleton className="h-4 w-64"/>
          </Button>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-full mb-2"/>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full"/>
              <Skeleton className="h-10 w-full"/>
              <Skeleton className="h-10 w-full"/>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24 mr-2"/>
              <Skeleton className="h-10 w-24"/>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (!calificacion){
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4"/>
          </Button>
          <h1 className="text-3xl font-bold">Calificación no encontrada</h1>
        </div>
        <p>No se pudo encontrar la calificación por el ID proporcionado.</p>
      </div>
    )
  }

  const handleEditar = () => {
    router.push(`/calificaciones/${id}/edit`)
  }

  const handleEliminar = async () => {
    setIsSubmitting(true)
    try{
      await eliminarCalificacion({ id: calificacion._id})
      router.push("/calificaciones")
    }catch(err){
      console.error("Error al eliminar calificación: ",err)
    }finally{
      setIsSubmitting(false)
      setModalEliminar(false)
    }
  }

  // Determinar color de nota
  const getNoteColor = (nota:number) => {
    if (nota < 6) return "text-red-600"
    if (nota >= 9) return "text-green-600"
    return ""
  }

  return (
    <div className="container mx-auto -py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4"/>
          <h1 className="text-3xl font-bold">Detalle de la calificación</h1>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Califiación
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleEditar}
              >
                <Pencil className="h-4 w-4"/>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setModalEliminar(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4"/>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Estudiante</h3>
            <div className="p-2 bg-muted rounded-b-md">
              {calificacion.estudiante?.numMatricula} - {calificacion.estudiante?.nombre}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Materia</h3>
            <div className="p-2 bg-muted rounded-b-md">
              {calificacion.materia?.identificador} - {calificacion.materia?.nombreMateria}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Nota</h3>
            <div className={`p-2 bg-muted rounded-b-md font-semibold ${getNoteColor(calificacion.nota)}`}>
              {calificacion.nota.toFixed(1)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Semestre</h3>
            <div className="p-2 bg-muted rounded-b-md">{calificacion.semestre}</div>
          </div>
        </CardContent>
      </Card>
      {/* Modal de confirmación para eliminar */}
      <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás completamente seguro?</DialogTitle>
            <DialogDescription>
              Esta accion no se puede desacher. La calificación sera eliminada permanentemente de la base de datos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalEliminar(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminar}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Eliminando" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
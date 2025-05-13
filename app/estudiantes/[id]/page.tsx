'use client'

import { use, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardContent,
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
} from "@/components/ui/dialog"

export default function DetalleEstudiantePage({ params }:{ params: Promise<{ id: string }> }){
    const { id } = use(params)
    const idEstudiante = id as Id<"estudiantes">
    const router = useRouter()
    const estudiante = useQuery(api.estudiantes.obtenerEstudiantePorId, { id: idEstudiante })
    const eliminarEstudiante = useMutation(api.estudiantes.eliminarEstudiante)
    
    const [modalEliminar, setModalEliminar] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if(estudiante === undefined){
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-64" />
                </div>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-full mb-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="w-24 h-10 mr-2" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if(!estudiante){
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Estudiante no encontrado</h1>
                </div>
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>No se pudo encontrar el estudiante con el ID proporcionado</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const handlerEditar = ( ) => {
        router.push(`/estudiantes/${id}/editar`)
    }

    const handlerEliminar = async () => {
        setIsSubmitting(true)
        try{
            await eliminarEstudiante({ id: estudiante._id })
            router.push('/estudiantes')
        }catch (error) {
            console.error("Error al eliminar el estudiante:", error)
        }finally {
            setIsSubmitting(false)
            setModalEliminar(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Detalles del Estudiante</h1>
            </div>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">
                            {estudiante.nombre}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlerEditar}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setModalEliminar(true)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Númenro de matrícula</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.numMatricula}</div>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Nombre completo</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.nombre}</div>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Correo electrónico</h3>
                        <div className="p-2 bg-muted rounded-md">{estudiante.correo}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de confirmación de eliminación */}
            <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Estás completamente seguro?</DialogTitle>
                        <DialogDescription>
                            Esta accion no se puede deshacer. El estudiente {estudiante.nombre} seré eliminado permanentemente de la base de datos.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalEliminar(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handlerEliminar} disabled={isSubmitting}>
                            {isSubmitting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
'use client'

import { use, useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditarEstudiantePage({ params } : { params: Promise<{ id: string}> } ){
    const resolvedParams = use(params)
    const { id: numMatricula } = resolvedParams
    const router = useRouter()
    const estudiante = useQuery(api.estudiantes.obtenerEstudiantePorId, { numMatricula })
    const actualizarEstudiante = useMutation(api.estudiantes.actualizarEstudiante)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fromData, setFromData] = useState({
        numMatricula: "",
        nombre: "",
        correo: "",
    })

    // Caragar datod del estudiante cuando esten disponibles
    useEffect(() => {
        if(estudiante){
            setFromData({
                numMatricula: estudiante.numMatricula,
                nombre: estudiante.nombre,
                correo: estudiante.correo,
            })
        }
    }, [estudiante])
    

    if (estudiante === undefined) {
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
                    <CardContent className="space-y-6">
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
                    <h1 className="text-2xl font-bold">Estudiante no encontrado</h1>
                </div>
                <p>
                    No se pudo encontrar el estudiante con el ID proporcionado.
                </p>
            </div>
        )
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFromData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await actualizarEstudiante({
                id: estudiante._id,
                ... fromData
            })
            router.push(`/estudiantes/${numMatricula}`)
        } catch (error) {
            console.error("Error al actualizar el estudiante:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Editar estudiante</h1>
            </div>

            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">
                            Modificar informacion del estudiante
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="numMatricula">Número de matrícula</Label>
                            <Input
                                id="numMatricula" 
                                type="text" 
                                name="numMatricula"
                                value={fromData.numMatricula}
                                onChange={handleChange}
                                placeholder="Ej. A12345"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numMatricula">Nombre completo</Label>
                            <Input
                                id="nombre" 
                                type="text" 
                                name="nombre"
                                value={fromData.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del estudiante"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numMatricula">Correo electrónico</Label>
                            <Input
                                id="correo" 
                                type="text" 
                                name="correo"
                                value={fromData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 mt-8"
                        >
                            <Save className="h-4 w-4"/>
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
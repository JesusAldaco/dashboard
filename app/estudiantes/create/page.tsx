'use client'

import { useState } from "react"
import { useMutation } from "convex/react"
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
import { ArrowLeft } from "lucide-react"

export default function CrearEstudiantePage() {
    const router = useRouter()
    const crearEstudiante = useMutation(api.estudiantes.crearEstudiante)

    const [fromData, setFormData] = useState({
        numMatricula: "",
        nombre: "",
        correo: ""
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await crearEstudiante(fromData)
            router.push("/estudiantes")
        } catch (error) {
            console.error("Error al crear el estudiante:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Crear nuevo estudiante
                    </h1>
                </div>
            </div>
            <Card className="w-full max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="font-semibold text-center">Información del estudiante</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="numMatricula">Número de matrícula</Label>
                            <Input
                                type="text"
                                id="numMatricula"
                                name="numMatricula"
                                value={fromData.numMatricula}
                                onChange={handleChange}
                                placeholder="Ej: A23456"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={fromData.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del estudiante"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="correo">Correo electrónico</Label>
                            <Input
                                type="email"
                                id="correo"
                                name="correo"
                                value={fromData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
                        <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                        >
                            {isSubmitting ? "Creando..." : "Crear estudiante"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
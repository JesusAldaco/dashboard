'use client'

import React, { useState } from "react"
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

export default function CrearMaestroPage () {
    const router = useRouter()
    const crearMaestro = useMutation(api.maestros.crearMaestro)
    const [formData, setFormData] = useState({
        numEmpleado: "",
        nombre: "",
        correo: ""
    })
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try{
            await crearMaestro(formData)
            router.push("/maestros")
        }catch(error){
            console.error("Error al crear maestro", error)
        }finally{
            setIsSubmitting(false)
        }
    }

    return (
      <div className="container px-4 sm:px-6 lg:px-8 py-10 mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Crear Nuevo Maestro
            </h1>
          </div>
        </div>
        <Card className="w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="font-semibold text-center">
                Información del Maestro
              </CardTitle>
              
            </CardHeader>
            <CardContent>
              <div className="grid grid-2">
                <Label htmlFor="numEmpleado">Número de Empleado</Label>
                <Input 
                  id="numEmpleado"
                  name="numEmpleado"
                  value={formData.numEmpleado}
                  onChange={handleChange}
                  placeholder="Ej: A12345"
                  required
                />
              </div>
              <div className="grid grid-2">
                <Label htmlFor="numEmpleado">Nombre completo</Label>
                <Input 
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: A12345"
                  required
                />
              </div>
              <div className="grid grid-2">
                <Label htmlFor="numEmpleado">Correo electrónico</Label>
                <Input 
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="correo@ejemlo.com"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onChange={() => router.back()}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Creando..." : "Crear maestro"}
              </Button>
            </CardFooter>
          </form>
        </Card>         
      </div>
    )
}
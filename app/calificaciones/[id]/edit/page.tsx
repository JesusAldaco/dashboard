'use client'

import { useState, useEffect, use, useReducer } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EditarCalificacionPage({params}:{params: Promise<{ id: string }>}){
  const {id} = use(params)
  const idCalificaciones = id as Id<"calificaciones">
  const router = useRouter()
  const calificacion = useQuery(api.calificaciones.obtenerCalificacionesByID, {id: idCalificaciones})
  const actualizarCalificacion = useMutation(api.calificaciones.actualizarCalificacion)

  //Obtener lista de estidoantes y materias para los selectores
  const estudiantes = useQuery(api.calificaciones.obtenerEstudiantes) || []
  const materias = useQuery(api.calificaciones.obtenerMatrias) || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    estudianteID: "",
    materiaID: "",
    nota: "",
    semestre: ""
  })

  // Lista de semestres para el selector.
  const semestres = [
    "2024-1", "2024-2", "2025-1", "2025-2"
  ]

  // Caragar datos de la calificación cuando esten disponibles
  useEffect(() => {
    if (calificacion) {
      setFormData({
        estudianteID: calificacion.estudianteID,
        materiaID: calificacion.materiaID,
        nota: calificacion.nota.toString(),
        semestre: calificacion.semestre
      })
    }
  }, [calificacion])

  if (calificacion === undefined || estudiantes === undefined || materias === undefined)
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
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )

  if (!calificacion) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Calificación no encontrada</h1>
        </div>
        <p>No se pudo encontrar la calificación con el ID proporcionado.</p>
      </div>
    );
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await actualizarCalificacion({
        id: calificacion._id,
        estudianteID: formData.estudianteID as Id<"estudiantes">,
        materiaID: formData.materiaID as Id<"materias">,
        nota: parseFloat(formData.nota),
        semestre: formData.semestre,
      });
      router.push(`/calificaciones/${id}`);
    } catch (error: unknown) {
      console.error("Error al actualizar calificación:", error);
      let errorMessage = 'Desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Error al actualizar calificación: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formIsValid = 
    formData.estudianteID && 
    formData.materiaID && 
    formData.nota && 
    !isNaN(parseFloat(formData.nota)) &&
    parseFloat(formData.nota) >= 0 && 
    parseFloat(formData.nota) <= 10 &&
    formData.semestre;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Calificación</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-semibold text-center">Modificar información de la calificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="estudianteId">Estudiante</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("estudianteId", value)}
                value={formData.estudianteID}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {estudiantes.map((estudiante) => (
                    <SelectItem key={estudiante._id} value={estudiante._id}>
                      {estudiante.numMatricula} - {estudiante.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="materiaId">Materia</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("materiaId", value)}
                value={formData.materiaID}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la materia" />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((materia) => (
                    <SelectItem key={materia._id} value={materia._id}>
                      {materia.identificador} - {materia.nombreMateria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nota">Nota (0-10)</Label>
              <Input
                id="nota"
                name="nota"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.nota}
                onChange={handleInputChange}
                placeholder="Ej: 8.5"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="semestre">Semestre</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("semestre", value)}
                value={formData.semestre}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el semestre" />
                </SelectTrigger>
                <SelectContent>
                  {semestres.map((semestre) => (
                    <SelectItem key={semestre} value={semestre}>
                      {semestre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
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
              disabled={isSubmitting || !formIsValid}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

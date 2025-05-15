'use client'

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/router" 

export function TablaMaterias(){
    const router = useRouter()
    const materias = useQuery(api.materias.obtenerMaterias)

    if(materias === undefined){
        return <div>Cargando materias...</div>
    }

    const handleVerMaterias = (id: string) => {
      router.push(`/materias/${id}`)
    }

    const handleCrear = () => {
      router.push("/materias/create")
    }

    return (
      <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Lista de Materias
        </h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4"/>
          Nueva materia
        </Button>
      </div>
      <Table>
        <TableCaption>Lista de materias registradas</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Identidicador</TableHead>
            <TableHead>Nombre de la materia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No hay materias registradas
              </TableCell>
            </TableRow>
          ):(
            materias.map((materia) => (
              <TableRow
                key={materia._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleVerMaterias(materia._id)}
              >
                <TableCell className="font-medium">
                  {materia.identificador}
                </TableCell>
                <TableCell>
                  {materia.nombreMateria}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </>
    )
}
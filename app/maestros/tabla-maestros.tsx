'use client'

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TablaMaestros() {
  const router = useRouter()
  const maestros = useQuery(api.maestros.obtenerMaestros)

  if (!maestros) {
    return <div>Cargando maestros...</div>
  }

  const handleVerMaestro = (id: string) => {
    router.push(`/maestros/${id}`)
  }

  const handleCrear = () => {
    router.push(`/maestros/create`)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-x1 font-semibold">Lista de Maestros</h2>
        <Button onClick={handleCrear} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo maestro
        </Button>
      </div>
      <Table>
        <TableCaption>Lista de maestros registrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Número Empleado</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maestros.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No hay maestros registrados
              </TableCell>
            </TableRow>
          ) : (
            maestros.map((maestro) => (
              <TableRow
                key={maestro._id}
                onClick={() => handleVerMaestro(maestro._id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                    {maestro.numEmpleado}
                </TableCell>
                <TableCell>{maestro.nombre}</TableCell>
                <TableCell>{maestro.correo}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  )
}
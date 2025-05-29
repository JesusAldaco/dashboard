"use client"

import * as React from 'react'
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CalificacionEstudiante {
  materia: string
  nota: number
  semestre: string
}

export function TablaEstudiantes() {
  const router = useRouter()
  const estudiantes = useQuery(api.estudiantes.obtenerEstudiantes)
  const calificacionesData = useQuery(api.calificaciones.obtenerCalificaciones)
  const [openRows, setOpenRows] = React.useState<string[]>([])

  const hasData = estudiantes !== undefined && calificacionesData !== undefined

  const calificacionesPorEstudiante = React.useMemo(() =>{
    if(!hasData) {
      return {}
    }  
    const grouped: Record<string, CalificacionEstudiante[]> = {}
    calificacionesData.forEach((calificacion) => {
      if(calificacion.estudiante?.id){
      if(!grouped[calificacion.estudiante.id]){
        grouped[calificacion.estudiante.id] = [] // ← inicializa el array
      }
      grouped[calificacion.estudiante.id].push({
        materia: calificacion.materia?.nombreMateria || 'N/A',
        nota: calificacion.nota,
        semestre: calificacion.semestre
      })
    }

      // if(calificacion.estudiante?.id){
      //   if(!grouped[calificacion.estudiante.id]){
      //     grouped[calificacion.estudiante.id].push({
      //       materia: calificacion.materia?.nombreMateria || 'N/A',
      //       nota: calificacion.nota,
      //       semestre:calificacion.semestre
      //     })
      //   }
      // }
    })
    return grouped
  }, [hasData, calificacionesData])

  const toggleRow = (id: string) => {
    setOpenRows((prev => 
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : ([...prev, id])
    ))
  }

  if(!hasData) {
      return <div>Cargando información</div>
  }

  const handleVerEstudiante = (estudiante: {id: string; numMatricula: string}) => {
      router.push(`/estudiantes/${estudiante.numMatricula}`)
  }

  const handleCrearEstudiante = () => {
      router.push(`/estudiantes/create`)
  }

  return (
      <>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-x1 font-semibold">Lista de Estudiantes</h2>
          <Button onClick={handleCrearEstudiante} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo estudiante
          </Button>
      </div>
      <Table>
          <TableCaption>Lista de estudiantes registrados</TableCaption>
          <TableHeader>
              <TableRow>
                  <TableHead className="w-[100px]">Matrícula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
              {estudiantes.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={3} className="text-center">
                          No hay estudiantes registrados
                      </TableCell>
                  </TableRow>
              ):(
                  estudiantes.map((estudiante) => (
                    <React.Fragment key={estudiante._id}>
                      <TableRow className="hover:bg-muted/50" >
                        <TableCell>
                          <Collapsible open={openRows.includes(estudiante._id)}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleRow(estudiante._id)}
                                aria-label={`Toggle calificaciones de ${estudiante.nombre}`}
                              >
                                {openRows.includes(estudiante._id)?(
                                  <ChevronDown size={16}/>
                                ):(
                                  <ChevronRight size={16}/>
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        </TableCell>
                        <TableCell
                          className='font-medium cursor-pointer'
                          onClick={() => handleVerEstudiante({ id: estudiante._id, numMatricula: estudiante.numMatricula } /*estudiante*/)}
                        >
                          {estudiante.numMatricula}
                        </TableCell>
                        <TableCell>{estudiante.nombre}</TableCell>
                        <TableCell>{estudiante.correo}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className='p-0 border-0'>
                          <Collapsible open={openRows.includes(estudiante._id)}>
                            <CollapsibleContent>
                              <div className='pl-6 py-2'>
                                <h3 className='text-sm font-semibold mb-2'>
                                  Calificaciones de {estudiante.nombre}
                                </h3>
                                {calificacionesPorEstudiante[estudiante._id]?.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Nota</TableHead>
                                        <TableHead>Semeste</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {calificacionesPorEstudiante[estudiante._id]?.map(
                                        (calificacion, index) => (
                                          <TableRow key={index}>
                                            <TableCell>{calificacion.materia}</TableCell>
                                            <TableCell>{calificacion.nota}</TableCell>
                                            <TableCell>{calificacion.semestre}</TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                ):(
                                  <p className='text-sm text-muted-foreground'>
                                    Este estudiante no tiene calificaciones registradas.
                                  </p>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
              )}
          </TableBody>
      </Table>
      </>
  )
}
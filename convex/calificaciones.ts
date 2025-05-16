import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Consulta para obtener todas las calificaciónes
export const obtenerCalificaciones = query({
    handler: async (ctx) => {
      // Obtener todas las calificaciónes
      const calificaciones = await ctx.db.query("calificaciones").collect()

      // Para cada calificación, obtenemos los datos relacionados
      const calificacionesConDetalles = await Promise.all(
        calificaciones.map(async (calificacion) => {
          const estudiante = await ctx.db.get(calificacion.estudianteID)
          const materia = await ctx.db.get(calificacion.materiaID)

          return {
            ...calificacion,
            estudiante: estudiante ? {
              id: estudiante._id,
              nombre: estudiante.nombre,
              numMatricula: estudiante.numMatricula
            } : null,
            materia: materia ? {
              id: materia._id,
              nombreMateria: materia.nombreMateria,
              identificador: materia.identificador
            } : null
          }
        }) 
      )
      return calificacionesConDetalles
    }
})

// Consulta para obtener una calificación por ID
export const obtenerCalificacionesByID = query({
  args: { id: v.id("calificaciones") },
    handler: async (ctx, args) => {
      const calificacion = await ctx.db.get(args.id)

      if(!calificacion) return null

      const estudiante = await ctx.db.get(calificacion.estudianteID)
      const materia = await ctx.db.get(calificacion.materiaID)

      return {
        ...calificacion,
        estudiante: estudiante ? {
          id: estudiante._id,
          nombre: estudiante.nombre,
          numMatricula: estudiante.numMatricula
        } : null,
        materia: materia ? {
          id: materia._id,
          nombreMateria: materia.nombreMateria,
          identificador: materia.identificador
        } : null
      }
    }
})

// Mutación para crear una nueva calificación
export const crearCalificación = mutation({
  args:{
    estudianteID: v.id("estudiantes"),
    materiaID: v.id("materias"),
    nota: v.number(),
    semestre: v.string()
  },
  handler: async (ctx, args) => {
    const { estudianteID, materiaID, nota, semestre } = args

    //validar que el estudiante y la materia existen
    const estudiante = await ctx.db.get(estudianteID)
    const materia = await ctx.db.get(materiaID)

    if (!estudiante){
      throw new Error("El estudiante no existe")
    }
    if (!materia){
      throw new Error("La materia no existe")
    }

    // Validación de la nota
    if ( nota < 0 || nota > 10 ){
      throw new Error("La nota debe estar entre 0 y 10")
    }

    return await ctx.db.insert("calificaciones",{
      estudianteID,
      materiaID,
      nota,
      semestre
    })
  }
})

// Mutación para actualizar una calificación existente
export const actualizarCalificación = mutation({
  args:{
    id: v.id("calificaciones"),
    estudianteID: v.id("estudiantes"),
    materiaID: v.id("materias"),
    nota: v.number(),
    semestre: v.string()
  },
  handler: async (ctx, args) => {
    const { id, estudianteID, materiaID, nota, semestre } = args

    //validar que el estudiante y la materia existen
    const estudiante = await ctx.db.get(estudianteID)
    const materia = await ctx.db.get(materiaID)

    if (!estudiante){
      throw new Error("El estudiante no existe")
    }
    if (!materia){
      throw new Error("La materia no existe")
    }

    // Validación de la nota
    if ( nota < 0 || nota > 10 ){
      throw new Error("La nota debe estar entre 0 y 10")
    }

    return await ctx.db.patch(id,{
      estudianteID,
      materiaID,
      nota,
      semestre
    })
  }
})

// Mutación para eliminar una calificación
export const eliminarCalificacion = mutation({
  args: {id: v.id("calificaciones")},
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  }
})

// Consulta para obtener todos los estudiantes (para selector)
export const obtenerEstudiantes = query({
    handler: async (ctx) => {
        return await ctx.db.query("estudiantes").collect();
    },
})

// Consulta para obtener todas las materias (para selector)
export const obtenerMatrias = query({
    handler: async (ctx) => {
        return await ctx.db.query("materias").collect();
    },
})
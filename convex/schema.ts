import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    estudiantes: defineTable({
        numMatricula: v.string(),
        nombre: v.string(),
        correo: v.string()
    }),
    maestros: defineTable({
        numEmpleado: v.string(),
        nombre: v.string(),
        correo: v.string(),
    }),
    materias: defineTable({
        identificador: v.string(),
        nombreMateria: v.string()
    }),
    salones: defineTable({
        numSalon: v.string(),
        edificio: v.string(),
        planta: v.string()
    })
})
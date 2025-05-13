import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Consulta para obtener todos los estudiantes
export const obtenerEstudiantes = query({
    handler: async (ctx) => {
        return await ctx.db.query("estudiantes").collect();
    },
})

// Consulta para obtener un estudiante por su ID
export const obtenerEstudiantePorId = query({
    args: { id: v.id("estudiantes") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
})

// Mutación para agregar un nuevo estudiante
export const crearEstudiante = mutation({
    args: {
        numMatricula: v.string(),
        nombre: v.string(),
        correo: v.string()
    },
    handler: async (ctx, args) => {
        const { numMatricula, nombre, correo } = args;
        return await ctx.db.insert("estudiantes", {
            numMatricula,
            nombre,
            correo
        });
    }
})

// Mutación para actualizar un estudiante existente
export const actualizarEstudiante = mutation({
    args: {
        id: v.id("estudiantes"),
        numMatricula: v.string(),
        nombre: v.string(),
        correo: v.string()
    },
    handler: async (ctx, args) => {
        const { id, numMatricula, nombre, correo } = args;
        return await ctx.db.patch(id, {
            numMatricula,
            nombre,
            correo
        });
    }
})

// Mutación para eliminar un estudiante
export const eliminarEstudiante = mutation({
    args: { id: v.id("estudiantes") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    }
})
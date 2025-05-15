import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Consulta para obtener todos los maestros
export const obtenerMaestros = query({
    handler: async (ctx) => {
        return await ctx.db.query("maestros").collect();
    }
})

// Consulta para obtener un maestro por su ID
export const obtenerMaestrosPorId = query({
    args: { id: v.id("maestros") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
})

// Mutación para crear un nuevo maestro
export const crearMaestro = mutation({
    args: {
        numEmpleado: v.string(),
        nombre: v.string(),
        correo: v.string(),
    },
    handler: async (ctx, args) => {
        const { numEmpleado, nombre, correo } = args;
        return await ctx.db.insert("maestros", {
            numEmpleado,
            nombre,
            correo,
        });
    }
})

// Mutación para actualizar un maestro existente
export const actualizarMaestro = mutation({
    args: {
        id: v.id("maestros"),
        numEmpleado: v.string(),
        nombre: v.string(),
        correo: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, numEmpleado, nombre, correo } = args;
        return await ctx.db.patch(id, {
            numEmpleado,
            nombre,
            correo,
        });
    }
})

// Mutación para eliminar un maestro
export const eliminarMaestro = mutation({
    args: { id: v.id("maestros") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    }
})
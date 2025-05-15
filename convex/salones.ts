import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Consulta para obtener todos los salones
export const obtenerSalones = query({
    handler: async (ctx) => {
        return await ctx.db.query("salones").collect();
    },
});

// Consulta para obtener un salón por ID
export const obtenerSalonesPorId = query({
    args: { id: v.id("salones") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Mutación para crear un nuevo salón
export const crearSalon = mutation({
    args: {
        numSalon: v.string(),
        edificio: v.string(),
        planta: v.string(),
    },
    handler: async (ctx, args) => {
        const { numSalon, edificio, planta } = args;
        return await ctx.db.insert("salones", {
            numSalon,
            edificio,
            planta,
        });
    },
});

// Mutación para actualizar un salón existente
export const actualizarSalon = mutation({
    args: {
        id: v.id("salones"),
        numSalon: v.string(),
        edificio: v.string(),
        planta: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, numSalon, edificio, planta } = args;
        return await ctx.db.patch(id, {
            numSalon,
            edificio,
            planta,
        });
    },
});

// Mutación para eliminar un salón
export const eliminarSalon = mutation({
    args: {
        id: v.id("salones"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    },
});
import { mutation, query } from "../_generated/server"
import { v } from "convex/values"

// Nueva función para crear un usuario, llamada desde la API Route de Next.js
export const createUser = mutation({
    args: {
        clerkId: v.string(), // Se renombra el clerkUserId para mayor claridad
        nombre: v.string(),
        email: v.string(),
        role: v.string(), // Se incluye el rol
    },
    handler: async (ctx, { clerkId, nombre, email, role }) => {
      // Aqui no hay verificación de existencia previa de correo porque la API Route ya lo maneja con Clerk
      // Se asume que si llega aquí, ya paso por las verificaciones necesarias
      const userId = await ctx.db.insert("usuarios", {
        clerkId: clerkId,
        nombre: nombre,
        email: email,
        estado: "activo", // Estado por defecto al crear un usuario
        fechaCreacion: Date.now(), // Timestamp de creación
        role: role, // Asignar el rol proporcionado
      })
      return userId
    }
})

// Mutación para actualizar usuario (llamada desde la API Route de Next.js)
export const updateUser = mutation({
  args: {
    id: v.id("usuarios"), // ID de convex del usuario a actualizar
    nombre: v.optional( v.string()),
    email: v.optional(v.string()),
    estado: v.optional(v.union(v.literal("activo"), v.literal("bloqueado"))),
    role: v.optional(v.string()), // Permite actualizar el rol
  },handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates)
  }
})

// Mutación para eliminar usuario (llamada desde la API Route de Next.js)
export const deleteUser = mutation({
  args: {
    id: v.id("usuarios"), // ID de convex del usuario a eliminar
  },handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  }
})

// Consulta para obtener un usuario por su ID de Clerk
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(), // ID de Clerk del usuario
  },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db.query("usuarios").withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId)).first()
    return user
  }
})

// Consulta para obtener un usuario por su correo electrónico
export const getUserByEmail = query({
  args: {
    email: v.string(), // Correo electrónico del usuario
  },
  handler: async (ctx, { email }) => {
    return await ctx.db.query("usuarios").withIndex("by_email", (q) => q.eq("email", email)).first()
  }
})

// Consulta para obtener todos los usuarios, se mantiene igual para administración
export const getAllUsers = query({
  args: {
    estado: v.optional(v.union(v.literal("activo"), v.literal("bloqueado"))), // Filtro opcional por estado
    busqueda: v.optional(v.string()), // Filtro opcional por nombre o correo
  },
  handler: async (ctx, { estado, busqueda }) => {
    let userQuery = ctx.db.query("usuarios")

    if (estado) {
      userQuery = userQuery.filter((q) => q.eq(q.field("estado"), estado))
    }

    if (busqueda){
      const lowerSearch = busqueda.toLowerCase()
      userQuery = userQuery.filter((q) => 
        q.or(
          q.eq(q.field("nombre"), lowerSearch),
          q.eq(q.field("email"), lowerSearch),
        )
      )
    }

    const usuarios = await userQuery.order("desc").collect()
    return usuarios
  }
})
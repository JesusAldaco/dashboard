/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as estudiantes from "../estudiantes.js";
import type * as horarios from "../horarios.js";
import type * as maestros from "../maestros.js";
import type * as materias from "../materias.js";
import type * as salones from "../salones.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  estudiantes: typeof estudiantes;
  horarios: typeof horarios;
  maestros: typeof maestros;
  materias: typeof materias;
  salones: typeof salones;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

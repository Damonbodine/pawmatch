/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as animalMedicalRecords from "../animalMedicalRecords.js";
import type * as animals from "../animals.js";
import type * as applications from "../applications.js";
import type * as auditLogs from "../auditLogs.js";
import type * as dashboard from "../dashboard.js";
import type * as favoriteAnimals from "../favoriteAnimals.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as seed from "../seed.js";
import type * as shelters from "../shelters.js";
import type * as staffAssignments from "../staffAssignments.js";
import type * as userSettings from "../userSettings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  animalMedicalRecords: typeof animalMedicalRecords;
  animals: typeof animals;
  applications: typeof applications;
  auditLogs: typeof auditLogs;
  dashboard: typeof dashboard;
  favoriteAnimals: typeof favoriteAnimals;
  messages: typeof messages;
  notifications: typeof notifications;
  seed: typeof seed;
  shelters: typeof shelters;
  staffAssignments: typeof staffAssignments;
  userSettings: typeof userSettings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

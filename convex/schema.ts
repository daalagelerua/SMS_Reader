import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  //users: defineTable({
    //fullName: v.string(),
    //email: v.string(),
    //... (other schema)
  //}),
});

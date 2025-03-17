import { pgTable, text, serial, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isSeller: boolean("is_seller").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isSeller: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ImageType = "photo" | "vector" | "illustration";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  tags: text("tags").array().notNull(),
  sellerId: integer("seller_id").notNull(),
  metadata: jsonb("metadata").notNull(),
});

export const insertImageSchema = createInsertSchema(images).pick({
  title: true,
  description: true,
  type: true,
  url: true,
  price: true,
  tags: true,
  sellerId: true,
  metadata: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageId: integer("image_id").notNull(),
  addedAt: text("added_at").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  imageId: true,
  addedAt: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

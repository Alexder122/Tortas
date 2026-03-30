import {
  pgTable,
  serial,
  varchar,
  numeric,
  timestamp,
  integer,
  text,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default('0'),
  created_at: timestamp("created_at").defaultNow(),
});

export const sale_items = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  sale_id: integer("sale_id").notNull().references(() => sales.id),
  product_id: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const app_credentials = pgTable("app_credentials", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  password_hash: text("password_hash").notNull(),
  password_salt: text("password_salt").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
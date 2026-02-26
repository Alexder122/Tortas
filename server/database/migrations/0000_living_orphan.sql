CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "Users" (
  "id" int PRIMARY KEY,
  "nome" varchar,
  "email" varchar,
  "senha" varchar
);

CREATE TABLE "Ingredients" (
  "id" int PRIMARY KEY,
  "nome" varchar,
  "unidade_medida" varchar
);

CREATE TABLE "User_Ingredient" (
  "id" int PRIMARY KEY,
  "id_usuario" int,
  "id_ingrediente" int,
  "quantidade" float,
  "validade" date
);

CREATE TABLE "Recipes" (
  "id" int PRIMARY KEY,
  "nome" varchar,
  "instrucoes" text,
  "categoria" varchar,
  "id_autor" int
);

CREATE TABLE "Recipe_Ingredients" (
  "id" int PRIMARY KEY,
  "id_receita" int,
  "id_ingrediente" int,
  "quantidade" float
);

CREATE UNIQUE INDEX ON "User_Ingredient" ("id_usuario", "id_ingrediente");

CREATE UNIQUE INDEX ON "Recipe_Ingredients" ("id_receita", "id_ingrediente");

ALTER TABLE "User_Ingredient" ADD FOREIGN KEY ("id_usuario") REFERENCES "Users" ("id");

ALTER TABLE "User_Ingredient" ADD FOREIGN KEY ("id_ingrediente") REFERENCES "Ingredients" ("id");

ALTER TABLE "Recipes" ADD FOREIGN KEY ("id_autor") REFERENCES "Users" ("id");

ALTER TABLE "Recipe_Ingredients" ADD FOREIGN KEY ("id_receita") REFERENCES "Recipes" ("id");

ALTER TABLE "Recipe_Ingredients" ADD FOREIGN KEY ("id_ingrediente") REFERENCES "Ingredients" ("id");

import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable("todos", {
    id: "id",
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    completed: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("todos", "created_at");
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable("todos");
};

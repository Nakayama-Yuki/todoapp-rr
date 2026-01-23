import { z } from "zod";

export const TodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
});

export const UpdateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  completed: z.boolean().optional(),
});

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTodoInput = z.infer<typeof TodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

import * as db from "~/db/index";
import { TodoSchema, UpdateTodoSchema } from "~/schemas/todo";
import type { Route } from "../routes/+types/home";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = formData.get("title");
    const data = { title };

    const validation = TodoSchema.safeParse(data);
    if (!validation.success) {
      return {
        error: validation.error.flatten().fieldErrors.title?.[0],
      };
    }

    try {
      await db.query("INSERT INTO todos (title, completed) VALUES ($1, $2)", [
        validation.data.title,
        false,
      ]);
      return { success: true };
    } catch (error) {
      console.error("Error creating todo:", error);
      return { error: "Failed to create todo" };
    }
  }

  if (intent === "update") {
    const id = formData.get("id");
    const title = formData.get("title");
    const completedStr = formData.get("completed");
    const completed = completedStr ? completedStr === "true" : undefined;

    const validation = UpdateTodoSchema.safeParse({
      title: title || undefined,
      completed,
    });
    if (!validation.success) {
      return {
        error: validation.error.flatten().fieldErrors.title?.[0],
      };
    }

    try {
      await db.query(
        "UPDATE todos SET title = COALESCE($1, title), completed = COALESCE($2, completed), updated_at = NOW() WHERE id = $3",
        [
          validation.data.title || null,
          validation.data.completed !== undefined
            ? validation.data.completed
            : null,
          id,
        ],
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating todo:", error);
      return { error: "Failed to update todo" };
    }
  }

  if (intent === "delete") {
    const id = formData.get("id");

    try {
      await db.query("DELETE FROM todos WHERE id = $1", [id]);
      return { success: true };
    } catch (error) {
      console.error("Error deleting todo:", error);
      return { error: "Failed to delete todo" };
    }
  }

  return { error: "Invalid action" };
}

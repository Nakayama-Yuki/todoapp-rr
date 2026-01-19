import * as db from "~/db/index";
import type { Todo } from "~/schemas/todo";

export async function loader(): Promise<Todo[]> {
  const result = await db.query("SELECT * FROM todos ORDER BY created_at DESC");
  return result.rows as Todo[];
}

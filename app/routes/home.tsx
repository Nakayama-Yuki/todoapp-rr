import type { Route } from "./+types/home";
import { Form, useActionData, useNavigation } from "react-router";
import { action } from "../components/home.action";
export { loader } from "../components/home.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "todoアプリ" },
    { name: "description", content: "React Routerで作成したtodoアプリ" },
  ];
}

export default function TodosPage({ loaderData }: Route.ComponentProps) {
  const todos = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Todos</h1>

        {/* Error message */}
        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-100">
            {actionData.error}
          </div>
        )}

        {/* Create form */}
        <Form method="post" className="mb-8">
          <div className="flex gap-2">
            <input type="hidden" name="intent" value="create" />
            <input
              type="text"
              name="title"
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </Form>

        {/* Todos list */}
        <div className="space-y-2">
          {todos.length === 0 ?
            <p className="text-slate-400 text-center py-8">
              No todos yet. Create one to get started!
            </p>
          : todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors group"
              >
                <Form method="post" className="flex-1 flex items-center gap-3">
                  <input type="hidden" name="intent" value="update" />
                  <input type="hidden" name="id" value={todo.id} />
                  <input
                    type="hidden"
                    name="completed"
                    value={String(!todo.completed)}
                  />
                  <button
                    type="submit"
                    className={`shrink-0 w-6 h-6 rounded border-2 transition-colors flex items-center justify-center ${
                      todo.completed ?
                        "bg-green-600 border-green-600"
                      : "border-slate-500 hover:border-green-600"
                    }`}
                  >
                    {todo.completed && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-left ${
                      todo.completed ?
                        "text-slate-400 line-through"
                      : "text-white"
                    }`}
                  >
                    {todo.title}
                  </span>
                </Form>

                <Form method="post" className="shrink-0">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </Form>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

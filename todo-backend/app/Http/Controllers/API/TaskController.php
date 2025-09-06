<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Task::where('user_id', $user->id);

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }
        if ($dueDate = $request->query('due_date')) {
            $query->whereDate('due_date', $dueDate);
        }

        $tasks = $query->orderBy('due_date');

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'status'      => 'in:pending,in_progress,done',
            'priority'    => 'in:low,medium,high',
            'due_date'    => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task = Task::create(array_merge(
            $validator->validated(),
            ['user_id' => $request->user()->id]
        ));

        return response()->json($task, 201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);

        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);

        $task->update($request->only([
            'title', 'description', 'status', 'priority', 'due_date'
        ]));

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }

    protected function authorizeTask($user, Task $task)
    {
        if ($task->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }
    }
}
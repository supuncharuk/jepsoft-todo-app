<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task;
use Auth;
use Validator;

class TaskController extends Controller
{
    public function __construct() {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::where('user_id', $user->id);

        // search
        if ($q = $request->query('q')) {
            $query->where(function($s) use ($q){
                $s->where('title','like', "%{$q}%")
                  ->orWhere('description','like', "%{$q}%");
            });
        }

        // filters
        if ($status = $request->query('status')) $query->where('status',$status);
        if ($priority = $request->query('priority')) $query->where('priority',$priority);
        if ($due = $request->query('due_date')) $query->whereDate('due_date',$due);

        // sort & paginate
        $tasks = $query->orderBy('due_date')->paginate(10);
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,done',
            'priority' => 'in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        if ($v->fails()) return response()->json(['errors'=>$v->errors()],422);

        $task = Task::create(array_merge($v->validated(), ['user_id' => $request->user()->id]));
        return response()->json($task, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);
        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);
        $task->update($request->only(['title','description','status','priority','due_date']));
        return response()->json($task);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Task $task)
    {
        $this->authorizeTask($request->user(), $task);
        $task->delete();
        return response()->json(['message'=>'deleted']);
    }

    protected function authorizeTask($user, Task $task){
        if ($task->user_id !== $user->id) abort(403);
    }
}

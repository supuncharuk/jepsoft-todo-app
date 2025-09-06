<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\AuthController;

Route::get('/test', function() {
    return 'API routes working!';
});

Route::post('/register',[AuthController::class,'register']);
Route::post('/login',[AuthController::class,'login']);

// Protected
Route::middleware('auth:sanctum')->group(function(){
    Route::get('/tasks/list', [TaskController::class, 'index']); // List tasks
    Route::post('/tasks/create', [TaskController::class, 'store']); // Create task
    Route::put('/tasks/update/{task}', [TaskController::class, 'update']); // Update task
    Route::delete('/tasks/delete/{task}', [TaskController::class, 'destroy']); // Delete task
    
    Route::post('/logout',[AuthController::class,'logout']);
});
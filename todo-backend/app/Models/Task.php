<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // Fields allowed for mass assignment
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
    ];

    // A Task belongs to a User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Optional: cast due_date to Carbon instance
    protected $casts = [
        'due_date' => 'date',
    ];
}
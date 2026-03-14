<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\AcademicSessionController;

Route::middleware(['auth'])->group(function () {
    Route::patch('semesters/{semester}/select', [AcademicSessionController::class, 'syncSemester'])->name('semesters.select');
    Route::patch('assignments/{assignment}/select', [AcademicSessionController::class, 'syncAssignment'])->name('assignments.select');
});

// /semesters/${id}/select

require __DIR__.'/settings.php';
require __DIR__.'/registration.php';
require __DIR__.'/academic.php';

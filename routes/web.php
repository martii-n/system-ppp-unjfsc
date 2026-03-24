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
    Route::patch('semesters/{semester}/select', [AcademicSessionController::class , 'syncSemester'])->name('semesters.select');
    Route::patch('assignments/{assignment}/select', [AcademicSessionController::class , 'syncAssignment'])->name('assignments.select');
});

// /semesters/${id}/select

// Rutas para el área Académica
Route::middleware(['auth', 'type:1,2'])
    //->prefix('academic')
    ->name('academic.')
    ->group(function () {
        require __DIR__ . '/academic/general.php';
        require __DIR__ . '/academic/dossier.php';
        require __DIR__ . '/academic/groups.php';
    });

// Rutas para el área de Empresas (placeholder para cuando las crees)
Route::middleware(['auth', 'type:1,3'])
    ->prefix('company')
    ->name('company.')
    ->group(function () {
        require __DIR__ . '/company/general.php';
    });

// Rutas compartidas o de configuración
require __DIR__ . '/settings.php';
require __DIR__ . '/user.php';
require __DIR__ . '/request.php';
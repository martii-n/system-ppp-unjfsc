<?php

use App\Http\Controllers\Academic\SemesterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/semesters', [SemesterController::class, 'index'])->name('semesters.index');
    Route::patch('/semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
    Route::post('/semesters/{semester}/close', [SemesterController::class, 'closeCurrentSemester'])->name('semesters.close');
    Route::post('/semesters/{semester}/back', [SemesterController::class, 'backCurrentSemester'])->name('semesters.back');
});

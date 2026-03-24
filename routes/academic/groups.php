<?php

use App\Http\Controllers\Academic\InternshipGroupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:1,2,3'])->group(function () {
    // List views
    Route::get('/groups/internship', [InternshipGroupController::class , 'indexByInternship'])->name('groups.internship');
    Route::get('/groups/student', [InternshipGroupController::class , 'indexByStudent'])->name('groups.student');

    // API Dependencies
    Route::get('/groups/api/sections/{section}/dependencies', [InternshipGroupController::class , 'getDependencies'])->name('groups.api.dependencies');
    Route::get('/groups/api/sections/{section}/students', [InternshipGroupController::class , 'getStudents'])->name('groups.api.students');
    Route::get('/groups/api/groups/{group}/students', [InternshipGroupController::class , 'getGroupStudents'])->name('groups.api.group_students');

    // Operations
    Route::post('/groups', [InternshipGroupController::class , 'store'])->name('groups.store');
    Route::delete('/groups/{group}', [InternshipGroupController::class , 'delete'])->name('groups.delete');
    Route::put('/groups/{group}', [InternshipGroupController::class , 'update'])->name('groups.update');
    Route::post('/groups/{group}/attach', [InternshipGroupController::class , 'attachStudents'])->name('groups.attach');
    Route::post('/groups/{group}/detach', [InternshipGroupController::class , 'detachStudents'])->name('groups.detach');
    Route::post('/groups/{group}/move', [InternshipGroupController::class , 'moveStudents'])->name('groups.move');
});
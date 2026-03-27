<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Academic\SupervisionController;

Route::middleware(['role:1,2,3'])->group(function () {
    Route::get('supervision/submission', [SupervisionController::class , 'submissionIndex'])->name('supervision.submission');
    Route::get('supervision/validation', [SupervisionController::class , 'validationIndex'])->name('supervision.validation');
    Route::get('supervision/api/groups', [SupervisionController::class , 'getGroupsByFilter'])->name('supervision.api.groups');
    Route::get('supervision/api/groups/{group}/students', [SupervisionController::class , 'getStudentsByGroupAndModule'])->name('supervision.api.group_students');
    Route::get('supervision/api/supervisions/{supervision}/annexes', [SupervisionController::class , 'getSupervisionAnnexes'])->name('supervision.api.annexes');

    Route::post('supervisions/{supervision}/evaluation', [SupervisionController::class , 'storeEvaluation'])->name('supervision.store');
    Route::patch('supervisions/{evaluation}/status', [SupervisionController::class , 'updateEvaluationStatus'])->name('supervision.update');
});
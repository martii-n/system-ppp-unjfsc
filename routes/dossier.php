<?php

use App\Http\Controllers\DossierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // My Dossier (Submission)
    Route::get('/dossier', [DossierController::class , 'SubmissionIndex'])->name('dossiers.submission');

    // Dossier Validation (Management)
    Route::get('/dossiers/validation', [DossierController::class , 'indexValidation'])->name('dossiers.validation');
    Route::get('/dossiers/validation/{dossier}', [DossierController::class , 'showValidation'])->name('dossiers.validation.show');

    Route::get('/dossiers/teacher', [DossierController::class , 'TeacherDossierIndex'])->name('dossiers.teacher');
    Route::get('/dossiers/supervisor', [DossierController::class , 'SupervisorDossierIndex'])->name('dossiers.supervisor');
    Route::get('/dossiers/student', [DossierController::class , 'StudentDossierIndex'])->name('dossiers.student');

    Route::get('/dossiers/api/validations/{assignment}', [DossierController::class , 'getDetailDossier'])->name('dossiers.api.validations');

    // Document Operations
    Route::post('/dossiers/document/store', [DossierController::class , 'storeDocumentDossier'])->name('dossiers.document.store');
    Route::patch('/dossiers/{document}/status', [DossierController::class , 'updateDossierStatus'])->name('dossiers.document.status');
});
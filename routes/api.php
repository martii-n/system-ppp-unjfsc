<?php

use App\Http\Controllers\Academic\InternshipController;
use App\Http\Controllers\Registration\UserRegistrationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Academic\InternshipGroupController;
use App\Http\Controllers\Academic\SupervisionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/registration/step-one', [UserRegistrationController::class , 'stepOne']);
Route::post('/registration/step-two', [UserRegistrationController::class , 'stepTwo']);
Route::post('/registration/step-three', [UserRegistrationController::class , 'stepThree']);

Route::post('/registration/user-academic', [UserRegistrationController::class , 'userAcademicRegistration']);
Route::post('/registration/user-company', [UserRegistrationController::class , 'userCompanyRegistration']);


Route::post('/documents/upload', [DocumentController::class , 'store']);
Route::patch('documents/{document}/status', [DocumentController::class , 'updateStatus']);

Route::post('internship-groups', [InternshipGroupController::class , 'store']);
Route::post('internship-groups/{group}/students', [InternshipGroupController::class , 'attachStudents']);
Route::delete('internship-groups/{group}/students/remove', [InternshipGroupController::class , 'detachStudents']);
Route::post('internship-groups/{group}/students/move', [InternshipGroupController::class , 'moveStudents']);

Route::post('supervisions/{supervision}/evaluation', [SupervisionController::class , 'storeEvaluation']);
Route::patch('supervisions/{evaluation}/status', [SupervisionController::class , 'updateEvaluationStatus']);


Route::post('internships/document/store', [InternshipController::class , 'storeDocumentInternship']);
Route::post('internships/{assignment}/store', [InternshipController::class , 'store']);
Route::patch('internships/{document}/status', [InternshipController::class , 'updateInternshipStatus']);
<?php

use App\Http\Controllers\ResourceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'approved'])->group(function () {
    Route::get('/resource', [ResourceController::class, 'index'])->name('resource.index');
    Route::post('/resource', [ResourceController::class, 'store'])->name('resource.store');
});
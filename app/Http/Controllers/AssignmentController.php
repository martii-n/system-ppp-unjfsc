<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Services\AssignmentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class AssignmentController extends Controller
{
    protected $assignmentService;

    public function __construct(AssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }
}
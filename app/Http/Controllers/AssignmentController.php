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

    /**
     * Select an assignment as active in the session and database.
     *
     * @return RedirectResponse
     */
    public function select(Assignment $assignment): RedirectResponse
    {
        $this->assignmentService->selectAssignment(Auth::user(), $assignment);

        return back()->with([
            'message' => 'Asignación seleccionada correctamente.',
        ], 200);
    }
}

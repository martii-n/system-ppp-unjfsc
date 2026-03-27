<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supervision\StoreEvaluationRequest;
use App\Http\Requests\Supervision\UpdateEvaluationStatusRequest;
use App\Models\Assignment;
use App\Models\Faculty;
use App\Models\InternshipGroup;
use App\Models\Supervision;
use App\Models\Evaluation;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Services\SupervisionService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupervisionController extends Controller
{
    protected $supervisionService;

    public function __construct(SupervisionService $supervisionService)
    {
        $this->supervisionService = $supervisionService;
    }

    public function submissionIndex(): Response
    {
        $faculties = Faculty::with('schools.sections')->where('status', 1)->get();

        return Inertia::render('academic/supervision/submission/index', [
            'faculties' => $faculties,
        ]);
    }

    public function validationIndex(): Response
    {
        $faculties = Faculty::with('schools.sections')->where('status', 1)->get();
        return Inertia::render('academic/supervision/validation/index', [
            'faculties' => $faculties
        ]);
    }

    /**
     * API: Returns internship groups filtered by academic structure.
     * Params: faculty_id, school_id (optional), section_id (optional)
     */
    public function getGroupsByFilter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'faculty_id' => 'required|integer|exists:faculties,id',
            'school_id' => 'nullable|integer|exists:schools,id',
            'section_id' => 'nullable|integer|exists:sections,id',
        ]);

        $groups = $this->supervisionService->getGroupsByFilter($data);

        return response()->json(['groups' => $groups]);
    }

    /**
     * API: Returns students of a group with their supervision status for a given module.
     * GET /supervision/api/groups/{group}/students?module_id={n}
     */
    public function getStudentsByGroupAndModule(InternshipGroup $group, Request $request): JsonResponse
    {
        $request->validate([
            'module_id' => 'required|integer|min:1|max:4',
        ]);

        $students = $this->supervisionService->getStudentsByGroupAndModule($group, (int)$request->module_id);

        return response()->json(['students' => $students]);
    }

    /**
     * API: Returns the Anexo 7 & Anexo 8 for a given supervision with evaluation history.
     * GET /supervision/api/supervisions/{supervision}/annexes
     */
    public function getSupervisionAnnexes(Supervision $supervision): JsonResponse
    {
        $annexes = $this->supervisionService->getSupervisionAnnexes($supervision);

        return response()->json(['annexes' => $annexes]);
    }

    public function storeEvaluation(StoreEvaluationRequest $request, Supervision $supervision): RedirectResponse
    {
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        $data = $request->validated();

        $this->supervisionService->registerEvaluation($data, $assignment, $supervision);

        return back()->with([
            'message' => 'Evaluación registrada correctamente.',
        ]);
    }

    public function updateEvaluationStatus(UpdateEvaluationStatusRequest $request, Evaluation $evaluation): RedirectResponse
    {
        $data = $request->validated();
        $this->supervisionService->updateEvaluationStatus($evaluation, $data);

        return back()->with([
            'message' => 'Evaluación actualizada correctamente.',
        ]);
    }
}
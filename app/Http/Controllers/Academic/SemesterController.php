<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Services\Academic\SemesterService;
use Illuminate\Http\JsonResponse;

class SemesterController extends Controller
{
    protected $semesterService;

    public function __construct(SemesterService $semesterService)
    {
        $this->semesterService = $semesterService;
    }

    public function index(): JsonResponse
    {
        $semesters = Semester::all();
        return response()->json([
            'message' => 'Semesters retrieved successfully',
            'data' => $semesters,
        ], 200);
    }

    public function closeCurrentSemester(Semester $semester): JsonResponse
    {
        $this->semesterService->closeCurrentSemester($semester->id);
        return response()->json(['message' => 'Semester closed successfully'], 200);
    }

    public function backCurrentSemester(Semester $semester): JsonResponse
    {
        $this->semesterService->backCurrentSemester($semester->id);
        return response()->json(['message' => 'Semester backed successfully'], 200);
    }
}

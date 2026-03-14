<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\SchoolRequest;
use App\Models\Faculty;
use App\Models\School;
use App\Services\Academic\SchoolService;
use Illuminate\Http\JsonResponse;

class SchoolController extends Controller
{
    protected $schoolService;

    public function __construct(SchoolService $schoolService)
    {
        $this->schoolService = $schoolService;
    }

    public function index(): JsonResponse
    {
        $schools = School::all();

        return response()->json([
            'message' => 'Schools retrieved successfully',
            'data' => $schools
        ], 200);
    }

    public function store(SchoolRequest $request, Faculty $faculty): JsonResponse
    {
        $data = $request->validated();

        $school = $this->schoolService->store($data, $faculty);

        return response()->json([
            'message' => 'School created successfully',
            'data' => $school
        ], 201);
    }

    public function update(SchoolRequest $request, School $school): JsonResponse
    {
        $data = $request->validated();

        $result = $this->schoolService->update($data, $school);

        return response()->json([
            'message' => 'School updated successfully',
            'data' => $result
        ], 200);
    }

    public function destroy(School $school): JsonResponse
    {
        $this->schoolService->delete($school);

        return response()->json([
            'message' => 'School deleted successfully'
        ], 200);
    }

}

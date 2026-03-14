<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\StoreSectionRequest;
use App\Http\Requests\Academic\UpdateSectionRequest;
use App\Models\School;
use App\Models\Section;
use App\Services\Academic\SectionService;
use Illuminate\Http\JsonResponse;

class SectionController extends Controller
{
    protected $sectionService;

    public function __construct(SectionService $sectionService)
    {
        $this->sectionService = $sectionService;
    }

    public function index(): JsonResponse
    {
        $sections = Section::all();

        return response()->json([
            'message' => 'Sections retrieved successfully',
            'data' => $sections
        ], 200);
    }

    public function store(StoreSectionRequest $request, School $school): JsonResponse
    {
        $data = $request->validated();

        $section = $this->sectionService->create($data, $school);

        return response()->json([
            'message' => 'Section created successfully',
            'data' => $section
        ], 201);
    }

    public function update(UpdateSectionRequest $request, Section $section): JsonResponse
    {
        $data = $request->validated();

        $section = $this->sectionService->update($section, $data);

        return response()->json([
            'message' => 'Section updated successfully',
            'data' => $section
        ], 200);
    }

    public function destroy(Section $section): JsonResponse
    {
        $this->sectionService->delete($section);

        return response()->json([
            'message' => 'Section deleted successfully',
        ], 200);
    }
}

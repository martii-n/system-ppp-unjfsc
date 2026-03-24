<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Group\AttachStudentsRequest;
use App\Http\Requests\Group\DetachStudentsRequest;
use App\Http\Requests\Group\MoveStudentsRequest;
use App\Http\Requests\Group\StoreGroupRequest;
use App\Http\Requests\Group\UpdateGroupRequest;
use App\Models\Faculty;
use App\Models\InternshipGroup;
use App\Models\Section;
use App\Services\InternshipGroupService;
use Illuminate\Http\JsonResponse;

use App\Models\Assignment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InternshipGroupController extends Controller
{
    protected InternshipGroupService $groupService;

    public function __construct(InternshipGroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    /**
     * Display a listing of internship groups (By Practice).
     */
    public function indexByInternship(): Response
    {
        $groups = $this->groupService->getInternshipGroups();
        $faculties = Faculty::with('schools.sections')->where('status', 1)->get();

        return Inertia::render('academic/group/internship/index', [
            'groups' => $groups,
            'faculties' => $faculties
        ]);
    }

    /**
     * Get teachers and suggested name for a specific section (By School).
     */
    public function getDependencies(Section $section): JsonResponse
    {
        return response()->json($this->groupService->getSectionDependencies($section));
    }

    /**
     * Display a listing of students and their groups (By Student).
     */
    public function indexByStudent(): Response
    {
        return Inertia::render('academic/group/student/index', [
            'groups' => $this->groupService->getInternshipGroups(),
            'students' => $this->groupService->getStudentsAndGroups()
        ]);
    }

    public function getStudents(Section $section): JsonResponse
    {
        return response()->json([
            'students' => $this->groupService->getAvailableStudents($section, session('semester_id'))
        ]);
    }

    public function getGroupStudents(InternshipGroup $group): JsonResponse
    {
        return response()->json([
            'students' => $this->groupService->getGroupStudents($group)
        ]);
    }

    public function store(StoreGroupRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->createGroup($data);
        return back()->with([
            'message' => 'Grupo creado correctamente.',
        ]);
    }

    public function update(UpdateGroupRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->updateGroup($group->id, $data);
        return back()->with([
            'message' => 'Grupo actualizado correctamente.',
        ]);
    }

    public function delete(InternshipGroup $group): RedirectResponse
    {
        $this->groupService->deleteGroup($group->id);
        return back()->with([
            'message' => 'Grupo eliminado correctamente.',
        ]);
    }

    public function attachStudents(AttachStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->attachStudents($group->id, $data['student_assignment_ids']);
        return back()->with('message', 'Estudiantes agregados correctamente.');
    }

    public function detachStudents(DetachStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->detachStudents($group->id, $data['student_assignment_ids']);
        return back()->with('message', 'Estudiantes retirados correctamente.');
    }

    public function moveStudents(MoveStudentsRequest $request, InternshipGroup $group): RedirectResponse
    {
        $data = $request->validated();
        $this->groupService->moveStudents(
            $group->id,
            $data['target_group_id'],
            $data['student_assignment_ids']
        );
        return back()->with('message', 'Estudiantes movidos correctamente.');
    }
}
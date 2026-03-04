<?php

namespace App\Http\Controllers;

use App\Http\Requests\Group\AttachStudentsRequest;
use App\Http\Requests\Group\DetachStudentsRequest;
use App\Http\Requests\Group\MoveStudentsRequest;
use App\Http\Requests\Group\StoreGroupRequest;
use App\Models\InternshipGroup;
use App\Services\InternshipGroupService;
use Illuminate\Http\JsonResponse;

class InternshipGroupController extends Controller
{
    protected  InternshipGroupService $groupService;

    public function __construct(InternshipGroupService $groupService)
    {
        $this->groupService = $groupService;
    }

    public function store(StoreGroupRequest $request): JsonResponse
    {
        $data = $request->validated();
        return response()->json(
            $this->groupService->createGroup($data)
        );
    }

    public function attachStudents(AttachStudentsRequest $request, InternshipGroup $group): JsonResponse
    {
        $data = $request->validated();
        return response()->json(
            $this->groupService->attachStudents($group->id, $data['student_assignment_ids'])
        );
    }

    public function detachStudents(DetachStudentsRequest $request, InternshipGroup $group): JsonResponse
    {
        $data = $request->validated();
        return response()->json([
            $this->groupService->detachStudents($group->id, $data['student_assignment_ids'])
        ]);
    }

    public function moveStudents(MoveStudentsRequest $request, InternshipGroup $group): JsonResponse
    {
        $data = $request->validated();
        return response()->json([
            $this->groupService->moveStudents(
                $group->id,
                $data['target_group_id'],
                $data['student_assignment_ids']
            )
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    protected $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    public function requestAssignmentManage(array $data, Assignment $assignment, Assignment $sender): Request
    {
        return DB::transaction(function () use ($data, $assignment, $sender) {
            $this->validateOwnership($assignment, $sender);

            $type = '';
            $msj = '';
            if ($data['action'] == 1) {
                $type = 'DELETE_ASSIGNMENT';
                $msj = 'Eliminar el usuario';
            }
            elseif ($data['action'] == 2) {
                $type = 'DISABLE_ASSIGNMENT';
                $msj = 'Deshabilitar el usuario';
            }
            elseif ($data['action'] == 3) {
                $type = 'ENABLE_ASSIGNMENT';
                $msj = 'Habilitar el usuario';
            }

            $assignment->review_status = 1;
            $assignment->save();

            $request = $this->requestService->createRequest(
                $sender,
                $assignment,
                $type,
            [
                'assignment_id' => $assignment->id,
                'access_status' => $assignment->access_status,
                'approval_status' => $assignment->approval_status,
            ],
                $data['reason'] ?? $msj
            );

            return $request->load('requestable');
        });
    }

    private function validateOwnership(Assignment $assignment, Assignment $sender): void
    {
        if (in_array($sender->role_id, [1, 2])) {
            return;
        }

        if (in_array($sender->role_id, [4, 5])) {
            throw new \Exception('You do not have permission to manage this assignment.');
        }

        if ($sender->role_id === 3) {
            if ($sender->section_id !== $assignment->section_id) {
                throw new \Exception('You do not have permission to manage this assignment.');
            }
        }
    }

    public function processEntityRemoval(Assignment $assignment): void
    {
        $user = $assignment->user;
        $authenticable = $user->authenticable;

        if ($assignment->internships()->exists() || $assignment->dosiers()->exists() || $assignment->documents()->exists()) {
            $assignment->update(['status' => 0]);
            $user->update(['status' => 0]);

            return;
        }

        $assignment->delete();

        if ($user->assignments()->count() === 0) {
            $user->delete();

            $otherUsersExist = User::query()->where('authenticable_id', $authenticable->id)
                ->where('authenticable_type', '<>', get_class($authenticable))
                ->exists();
            if (!$otherUsersExist) {
                $authenticable->delete();
            }
        }
    }
}
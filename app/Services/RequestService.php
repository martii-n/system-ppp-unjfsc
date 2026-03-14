<?php

namespace App\Services;

use App\Exceptions\RequestUnsupportedTypeException;

use App\Models\Assignment;
use App\Models\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;


class RequestService
{
    /**
     * @@param array $payload
     */
    public function createRequest(Model $sender, Model $target, string $type, array $payload, string $reason): Request
    {
        return $request = Request::query()->create([
            'senderable_id' => $sender->id,
            'senderable_type' => $sender->getMorphClass(),
            'requestable_id' => $target->id,
            'requestable_type' => $target->getMorphClass(),
            'type' => $type,
            'payload' => $payload,
            'reason' => $reason,
        ]);
    }

    /**
     * @@param array $data
     */
    public function managementRequestStatus(array $data, Request $request, Assignment $reviewer): Request
    {
        return DB::transaction(function () use ($request, $data, $reviewer) {
            $request->update([
                'reviewed_by' => $reviewer->id,
                'justification' => $data['justification'],
                'approval_status' => $data['approval_status']
            ]);

            if ($data['approval_status'] === 1) {
                $this->applyRequestAction($request);
            }

            return $request;
        });
    }

    private function applyRequestAction(Request $request): void
    {
        $target = $request->requestable;
        $payload = $request->payload;

        switch ($request->type) {
            case 'CHANGE_INTERNSHIP_TYPE':
                $target->update(['internship_type' => $payload['new_type']]);
                break;

            case 'CHANGE_INTERNSHIP_GRADE':
                $target->update(['grade' => $payload['new_grade']]);
                break;
            case 'DELETE_ASSIGNMENT':
                app(AssignmentService::class)->processEntityRemoval($target);
                break;
            case 'DISABLE_ASSIGNMENT':
                $target->update(['access_status' => 3]);
                break;
            case 'ENABLE_ASSIGNMENT':
                $target->update(['access_status' => 1]);
                break;
            default:
                throw new RequestUnsupportedTypeException();
        }
    }
}

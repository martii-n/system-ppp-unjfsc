<?php

namespace App\Http\Controllers;

use App\Http\Requests\Request\UpdateManagementRequestStatusRequest;
use App\Models\User;
use App\Services\RequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RequestController extends Controller
{
    protected $requestService;

    public function __construct(RequestService $requestService)
    {
        $this->requestService = $requestService;
    }

    /**
     * Update the management request status.
     *
     * @param UpdateManagementRequestStatusRequest $request
     * @param Request $model
     * @return JsonResponse
     */
    public function updateManagementRequestStatus(UpdateManagementRequestStatusRequest $request, Request $model): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $assignment = $user->activeAssignment;

        $data = $request->validated();

        $model = $this->requestService->managementRequestStatus($data, $model, $assignment);

        return response()->json([
            'message' => 'Solicitud actualizada exitosamente.',
            'data' => $model,
        ], 201);
    }
}

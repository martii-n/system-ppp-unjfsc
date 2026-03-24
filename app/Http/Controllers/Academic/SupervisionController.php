<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supervision\StoreEvaluationRequest;
use App\Http\Requests\Supervision\UpdateEvaluationStatusRequest;
use App\Models\Supervision;
use App\Models\Evaluation;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Services\SupervisionService;
use Illuminate\Http\JsonResponse;

class SupervisionController extends Controller
{
    protected $supervisionService;

    public function __construct(SupervisionService $supervisionService)
    {
        $this->supervisionService = $supervisionService;
    }

    //
    public function storeEvaluation(StoreEvaluationRequest $request, Supervision $supervision): JsonResponse
    {
        $data = $request->validated();
        $user = Auth::user() ?? User::first();

        $evaluation = $this->supervisionService->registerEvaluation($data, $user, $supervision);

        return response()->json([
            'message' => 'Evaluación y documento registrados correctamente.',
            'data' => $evaluation
        ], 201);
    }

    public function updateEvaluationStatus(UpdateEvaluationStatusRequest $request, Evaluation $evaluation): JsonResponse
    {
        $data = $request->validated();

        return response()->json(
            $this->supervisionService->updateEvaluationStatus($evaluation, $data)
        );
    }
}
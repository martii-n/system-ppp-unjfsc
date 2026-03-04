<?php

namespace App\Http\Controllers\Registration;
use App\Http\Controllers\Controller;

use App\Http\Requests\Registration\StepOneRequest;
use App\Http\Requests\Registration\StepTwoRequest;
use App\Http\Requests\Registration\StepThreeRequest;
use Illuminate\Http\JsonResponse;
use App\Services\Registration\UserRegistrationService;

class UserRegistrationController extends Controller
{

    public function stepOne(StepOneRequest $request, UserRegistrationService $service): JsonResponse
    {
        // Your code here
        $data = $request->validated();

        return response()->json(
            $service->validateStepOne($data)
        );
    }

    public function stepTwo(StepTwoRequest $request, UserRegistrationService $service): JsonResponse
    {
        // Your code here
        $data = $request->validated();

        return response()->json(
            $service->validateStepTwo($data)
        );
    }


    public function stepThree(StepThreeRequest $request, UserRegistrationService $service): JsonResponse
    {
        // Your code here
        $data = $request->validated();

        return response()->json(
            $service->validateStepThree($data)
        );
    }
}

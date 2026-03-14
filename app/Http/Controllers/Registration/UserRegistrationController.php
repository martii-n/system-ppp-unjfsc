<?php

namespace App\Http\Controllers\Registration;
use App\Http\Controllers\Controller;

use App\Http\Requests\Registration\StepOneRequest;
use App\Http\Requests\Registration\StepTwoRequest;
use App\Http\Requests\Registration\StepThreeRequest;
use App\Http\Requests\Registration\StoreCompanyRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Services\Registration\UserRegistrationService;
use Illuminate\Support\Facades\Auth;

class UserRegistrationController extends Controller
{
    protected $userService;

    public function __construct(UserRegistrationService $userService)
    {
        $this->userService = $userService;
    }


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

    public function userAcademicRegistration(StepThreeRequest $request, UserRegistrationService $service): JsonResponse
    {
        $user = Auth::user() ?? User::first();
        $authAssignment = $user->activeAssignment ?? null;

        $currentSemester = 1;

        // Your code here
        $data = $request->validated();

        $assignment = $service->registerUserAcademic($data, $currentSemester);

        return response()->json([
            'message' => '¡Registro completado exitosamente!',
            'data' => $assignment,
        ], 201);
    }

    public function userCompanyRegistration(StoreCompanyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = $this->userService->registerUserCompany($data);

        return response()->json([
            'message' => '¡Registro completado exitosamente!',
            'data' => $user,
        ], 201);
    }
}

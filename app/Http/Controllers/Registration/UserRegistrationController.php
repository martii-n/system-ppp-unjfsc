<?php

namespace App\Http\Controllers\Registration;

use App\Http\Controllers\Controller;

use App\Http\Requests\Registration\StepOneMassiveRequest;
use App\Http\Requests\Registration\StepOneRequest;
use App\Http\Requests\Registration\StepTwoRequest;
use App\Http\Requests\Registration\StepThreeRequest;
use App\Http\Requests\Registration\StoreCompanyRequest;
use App\Http\Requests\Registration\StorePersonMassiveRequest;
use App\Models\Faculty;
use App\Models\Role;
use App\Models\School;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use App\Services\Registration\UserRegistrationService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class UserRegistrationController extends Controller
{
    public function __construct(protected UserRegistrationService $userService)
    {
    }

    public function index(): Response
    {
        $semesterId = session('semester_id');

        $roles = Role::whereNotIn('id', [1, 6])->get();
        $faculties = Faculty::all();
        $schools = School::all();
        $sections = Section::where('semester_id', $semesterId)->get();

        return Inertia::render('academic/user/register/index', [
            'roles' => $roles,
            'faculties' => $faculties,
            'schools' => $schools,
            'sections' => $sections,
        ]);
    }


    public function stepOne(StepOneRequest $request, UserRegistrationService $service): JsonResponse
    {
        $semesterId = session('semester_id');

        $result = $service->validateStepOne(
            $request->validated(),
            $semesterId
        );

        return response()->json([
            'message' => $result['user_exists']
            ? 'La persona ya existe en el sistema'
            : 'Completa los datos de la persona',
            'data' => $result,
        ]);
    }

    public function stepOneMassive(StepOneMassiveRequest $request, UserRegistrationService $service): JsonResponse
    {
        $semesterId = session('semester_id');

        $result = $service->validateStepOneMassive(
            $request->validated(),
            $semesterId
        );

        return response()->json([
            'message' => $result['user_exists']
            ? 'La persona ya existe en el sistema'
            : 'Completa los datos de la persona',
            'data' => $result,
        ]);
    }

    public function stepTwo(StepTwoRequest $request, UserRegistrationService $service): JsonResponse
    {
        $data = $request->validated();

        $result = $service->validateStepTwo($data);

        return response()->json([
            'message' => $result['person_exists']
            ? 'La persona ya existe en el sistema'
            : 'No se ha encontrado la persona con DNI: ' . $data['dni'] . '. Por favor, complete los datos de la persona.',
            'data' => $result
        ]);
    }


    public function stepThree(StepThreeRequest $request, UserRegistrationService $service): JsonResponse
    {
        // Your code here
        $data = $request->validated();

        return response()->json(
            $service->validateStepThree($data)
        );
    }

    public function userAcademicRegistration(StepThreeRequest $request): RedirectResponse
    {
        $user = Auth::user() ?? User::first();

        $semesterId = session('semester_id');

        $assignmentId = session('assignment_id');

        $data = $request->validated();

        $this->userService->registerUserAcademic($data, $semesterId, $assignmentId);

        return back()->with([
            'message' => 'Usuario creado correctamente. Y notificado por correo electrónico.',
        ]);
    }


    public function userAcademicRegistrationMassive(StorePersonMassiveRequest $request): JsonResponse
    {
        $semesterId = session('semester_id');
        $assignmentId = session('assignment_id');

        $data = $request->validated();

        $report = $this->userService->registerUserAcademicMassive($data, $semesterId, $assignmentId);

        return response()->json([
            'message' => 'Procesamiento masivo finalizado.',
            'data' => $report,
        ]);
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
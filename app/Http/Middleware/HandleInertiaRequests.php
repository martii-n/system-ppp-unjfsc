<?php

namespace App\Http\Middleware;

use App\Services\Auth\SharedDataService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function __construct(protected SharedDataService $sharedDataService) {}

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $authData = $user
            ? $this->sharedDataService->getSharedPayload($user)
            : ['user' => null];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => $authData,
            'role' => fn () => $user && isset($authData['academic'])
                ? session('assignment_id') ? \App\Models\Assignment::find(session('assignment_id'))?->role_id : null
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}

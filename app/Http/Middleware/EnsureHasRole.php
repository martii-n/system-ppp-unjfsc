<?php

namespace App\Http\Middleware;

use App\Models\Assignment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            abort(403, 'No tienes una sesion de rol activa');
        }

        $roleId = Assignment::find($assignmentId)->role_id;

        if (! in_array($roleId, $roles)) {
            abort(403, 'No tienes permiso para acceder a esta ruta');
        }

        return $next($request);
    }
}

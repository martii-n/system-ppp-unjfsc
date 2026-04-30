<?php

namespace App\Http\Middleware;

use App\Enums\Assignment\AssignmentApprovalStatus;
use App\Models\Assignment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAssignmentApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if ($request->is('logout', 'settings/*', 'semesters/*/select', 'assignments/*/select', 'dossiers/document/store')) {
            return $next($request);
        }

        if (in_array($user->type_user_id, [1, 3])) {
            return $next($request);
        }

        // 2. Obtener el Assignment actual de la sesión
        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        if (in_array($assignment->role_id, [1, 2])) {
            return $next($request);
        }

        // 3. Si no hay asignación o no está aprobada
        if (!$assignment || $assignment->approval_status !== AssignmentApprovalStatus::APPROVED) {

            // PREVENCIÓN DE BUCLE INFINITO:
            // Si la ruta ya es la de 'academic.dossiers.submission', dejar pasar.
            if ($request->routeIs('academic.dossiers.submission')) {
                return $next($request);
            }

            return redirect()->route('academic.dossiers.submission');
        }

        return $next($request);
    }
}

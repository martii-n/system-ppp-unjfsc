<?php

namespace App\Services\Academic;

use App\Models\Assignment;
use App\Models\Resource;
use App\Models\Semester;
use Cassandra\Collection;
use Illuminate\Support\Facades\DB;

class SemesterService
{
    /**
     * Lista todos los semestres.
     * @return Collection
     */
    public function listSemesters(): Collection
    {
        return Semester::query()->get();
    }

    public function closeCurrentSemester(int $semesterId): Semester
    {
        return DB::transaction(function () use ($semesterId) {
            Assignment::query()->where('semester_id', $semesterId)->update(['access_status', 3]);

            Resource::query()->where('semester_id', $semesterId)
                ->where('level', '<', 5)
                ->update(['status' => 0]);

            $currentSemester = Semester::query()->find($semesterId);

            $currentSemester->status = 0;
            $currentSemester->save();

            $newCode = $this->generateNextCode($currentSemester->code);

            $nextSemester = Semester::query()->create([
                'code' => $newCode,
                'cycle' => $currentSemester->cycle,
                'status' => 1,
            ]);

            session(['semester_id' => $nextSemester->id]);

            return $nextSemester;
        });
    }

    /**
     * @@param int
     */
    public function backCurrentSemester(int $semesterId): Semester
    {
        $currentSemester = Semester::query()->find($semesterId);

        if ($currentSemester->status !== 1) {
            throw new \DomainException('Solo se puede retroceder desde un semestre activo.');
        }

        if (Semester::query()->count() <= 1) {
            throw new \DomainException('No hay semestres anteriores para retroceder.');
        }

        if ($currentSemester->assignments()->exists() || $currentSemester->sections()->exists()) {
            throw new \DomainException('No se puede retroceder, hay registros que dependen de este semestre, borre e intente nuevamente.');
        }

        $currentSemester->delete();

        $previousSemester = Semester::query()->orderBy('id', 'desc')->first();

        if (!$previousSemester) {
            throw new \DomainException('No hay semestres anteriores para retroceder.');
        }

        $previousSemester->update(['status' => 1]);
        session(['semester_id' => $previousSemester->id]);

        return $previousSemester;
    }

    private function generateNextCode(string $currentCode): string
    {
        $parts = explode('-', $currentCode);

        if (count($parts) !== 2) {
            throw new \InvalidArgumentException('Invalid semester code');
        }

        $year = $parts[0];
        $number = $parts[1];

        if ($number == 1) {
            return "{$year}-2";
        } else {
            $nextYear = (int) $year + 1;
            return "{$nextYear}-1";
        }
    }
}

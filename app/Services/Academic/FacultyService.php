<?php

namespace App\Services\Academic;

use App\Models\Faculty;
use Illuminate\Support\Facades\DB;

class FacultyService
{
    /**
     * Store a new faculty.
     *
     * @param array $data
     * @return Faculty
     */
    public function store(array $data): Faculty
    {
        return DB::transaction(function () use ($data) {
            $faculty = Faculty::query()->create($data);
            return $faculty;
        });
    }
}

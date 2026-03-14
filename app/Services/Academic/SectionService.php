<?php

namespace App\Services\Academic;

use App\Models\School;
use App\Models\Section;
use Illuminate\Support\Facades\DB;

class SectionService
{
    /**
     * Store a new section.
     *
     * @param  array  $data
     * @param  School  $school
     * @return Section
     */
    public function store(array $data, School $school): Section
    {
        return DB::transaction(function () use ($data, $school) {
            $section = Section::query()->create([
                'name' => $data['name'],
                'faculty_id' => $data['faculty_id'],
                'school_id' => $school->id,
            ]);

            return $section->load(['school', 'faculty']);
        });
    }

    /**
     * Update an existing section.
     *
     * @param  Section  $section
     * @param  array  $data
     * @return Section
     */
    public function update(Section $section, array $data): Section
    {
        return DB::transaction(function () use ($section, $data) {
            $section->update([
                'name' => $data['name'],
                'faculty_id' => $data['faculty_id'],
                'school_id' => $data['school_id']
            ]);

            return $section->load(['school', 'faculty']);
        });
    }

    /**
     * Delete an existing section.
     *
     * @param  Section  $section
     * @return void
     */
    public function delete(Section $section): void
    {
        $section->delete();
    }

}

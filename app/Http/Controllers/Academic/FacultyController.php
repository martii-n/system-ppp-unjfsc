<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\FacultyRequest;
use App\Models\Faculty;
use Illuminate\Http\RedirectResponse;

class FacultyController extends Controller
{
    //
    /**
    * Store a newly created resource in storage.
    */
    public function store(FacultyRequest $request): RedirectResponse
    {
        Faculty::query()->create($request->validated());

        return back();
    }

    /**
    * Update the specified resource in storage.
    */
    public function update(FacultyRequest $request, Faculty $faculty): RedirectResponse
    {
        $faculty->update($request->validated());

        return back();
    }

    /**
    * Remove the specified resource from storage.
    */
    public function destroy(Faculty $faculty): RedirectResponse
    {
        $faculty->delete();

        return back();
    }
}

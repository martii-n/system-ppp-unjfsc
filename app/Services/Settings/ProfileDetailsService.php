<?php

namespace App\Services\Settings;

use Illuminate\Database\Eloquent\Model;

class ProfileDetailsService
{
    /**
     * Update the user's profile details.
     *
     * @param Model $authenticable
     * @param array $data
     * @return Model
     */
    public function updateDetails(Model $authenticable, array $data): Model
    {
        $authenticable->update($data);
        return $authenticable;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'ruc',
        'razon',
        'address',
        'phone',
        'email',
        'website',
        'path_photo',
        'path_banner',
        'status'
    ];

    /**
     * Get the bosses associated with the company.
     * @return HasMany
     */
    public function bosses(): HasMany
    {
        return $this->hasMany(Boss::class);
    }
}

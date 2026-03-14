<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;


class Person extends Model
{
    use HasFactory;
    protected $fillable = [
        'id',
        'dni',
        'names',
        'surnames',
        'path_photo',
        'path_banner',
        'phone',
        'gender',
        'district_id',
        'status'
    ];

    /**
     * @return MorphMany
     */
    public function user(): MorphMany
    {
        return $this->morphMany(User::class, 'authenticable');
    }
}

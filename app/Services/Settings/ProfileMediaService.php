<?php

namespace App\Services\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileMediaService
{
    /**
     * @param Model $authenticable
     * @param mixed $photoFile (File | 'deleted' | null)
     * @param mixed $bannerFile (File | 'deleted' | null)
     * @return Model
     */
    public function updateMedia(Model $authenticable, $photoFile, $bannerFile): Model
    {
        if ($photoFile) {
            $this->processFile($authenticable, 'path_photo', 'avatar', $photoFile);
        }
        if ($bannerFile) {
            $this->processFile($authenticable, 'path_banner', 'banner', $bannerFile);
        }

        $authenticable->save();

        return $authenticable;
    }

    /**
     * @param Model $model
     * @param string $column
     * @param string $type
     * @param mixed $file (File | 'deleted' | null)
     */
    private function processFile(Model $model, string $column, string $type, $file): void
    {
        if ($model->{$column}) {
            Storage::disk('public')->delete($model->{$column});
            $model->{$column} = null;
        }

        if ($file !== 'deleted' && $file instanceof UploadedFile) {
            $yearMonth = date('Y/m');
            $modelType = strtolower(class_basename($model));

            $identifier = $model->dni ?? $model->ruc ?? $model->id;

            $folder = "profiles/{$modelType}/{$yearMonth}";
            $filename = "{$identifier}_{$type}_". time() . '.' . $file->extension();

            $model->{$column} = $file->storeAs($folder, $filename, 'public');
        }
    }
}

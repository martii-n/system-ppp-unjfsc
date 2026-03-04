<?php

namespace App\Services;

use App\Models\Resource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ResourceService
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Store a resource.
     *
     * @param array $data
     * @param Model $uploader
     * @return Resource
     */
    public function storeResource(array $data, Model $uploader): Resource
    {
        return DB::transaction(function () use ($data, $uploader) {
            $resource = Resource::query()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'uploader_id' => $uploader->id,
                'uploader_type' => $uploader->getMorphClass(),
                'role_id' => $data['role_id'],
                'level' => $data['level'],
                'document_type_id' => $data['document_type_id'],
                'location_id' => $data['location_id'] ?? null,
                'location_type' => $data['location_type'] ?? null,
                'semester_id' => $data['semester_id'] ?? null,
            ]);

            $this->documentService->registerDocument([
                'name' => $data['name'],
                'file' => $data['file'],
                'document_type_id' => $data['document_type_id'],
                'context' => 'resource',
            ], $uploader, $resource);

            return $resource->load('documents');
        });
    }

    /**
     * List resources for a user based on role, semester, and locations.
     * @param int $roleId
     * @param ?int $semesterId
     * @param array $locations
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function listResourcesForUser(int $roleId, ?int $semesterId, array $locations = [])
    {
        $query = Resource::query()->where('role_id', $roleId)
            ->where('status', 1)
            ->where(function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId)->orWhereNull('semester_id');
            });

        $query->where(function ($q) use ($locations) {
            $q->where('level', 1);

            foreach ($locations as $loc) {
                $q->orWhere(function ($q) use ($loc) {
                    $q->where('location_id', $loc);
                    $q->orWhere('location_type', $loc);
                });
            }
        });

        return $query->with('documents')->get();
    }
}

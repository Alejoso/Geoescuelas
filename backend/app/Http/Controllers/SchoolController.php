<?php

namespace App\Http\Controllers;

use App\Models\InstitucionEducativa;
use App\Http\Resources\SchoolResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SchoolController extends Controller
{
    public function index(): JsonResponse
    {
        $cached_schools = Cache::remember('school.map', now()->addHours(6), function () {
            return InstitucionEducativa::all();
        });

        $schools = SchoolResource::collection($cached_schools);

        return response()->json($schools, 200);
    }
}
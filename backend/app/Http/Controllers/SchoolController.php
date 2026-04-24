<?php

namespace App\Http\Controllers;
use App\Models\InstitucionEducativa;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\SchoolResource;

class SchoolController extends Controller
{
    public function index(): JsonResponse
    {
        $school = SchoolResource::collection(InstitucionEducativa::all());
        return response()->json($school , 200);
    }
}

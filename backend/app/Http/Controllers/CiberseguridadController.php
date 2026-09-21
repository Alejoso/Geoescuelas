<?php

namespace App\Http\Controllers;

use App\Http\Resources\CiberseguridadResource;
use App\Surveys\CiberseguridadAggregator;
use Illuminate\Support\Facades\Cache;

class CiberseguridadController extends Controller
{
    private const CACHE_TTL_SECONDS = 180;

    public function show(string $codDane): CiberseguridadResource
    {
        $summary = Cache::remember(
            self::cacheKey($codDane),
            self::CACHE_TTL_SECONDS,
            static fn (): array => array_merge(
                ['codDane' => $codDane],
                CiberseguridadAggregator::summaryForInstitution($codDane)
            )
        );

        return new CiberseguridadResource($summary);
    }

    public static function cacheKey(string $codDane): string
    {
        return "ciberseguridad-detail:{$codDane}";
    }
}
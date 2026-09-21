<?php

namespace App\Http\Controllers;

use App\Http\Resources\Saber11Resource;
use App\Surveys\Saber11Aggregator;
use Illuminate\Support\Facades\Cache;

class Saber11Controller extends Controller
{
    private const CACHE_TTL_SECONDS = 180;

    public function show(string $codDane): Saber11Resource
    {
        $summary = Cache::remember(
            self::cacheKey($codDane),
            self::CACHE_TTL_SECONDS,
            static fn (): array => array_merge(
                ['codDane' => $codDane],
                Saber11Aggregator::summaryForInstitution($codDane)
            )
        );

        return new Saber11Resource($summary);
    }

    public static function cacheKey(string $codDane): string
    {
        return "saber11-detail:{$codDane}";
    }
}
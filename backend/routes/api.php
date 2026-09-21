<?php

use Illuminate\Support\Facades\Route;
use App\Surveys\SurveyCatalog;

Route::get('/school' , 'App\Http\Controllers\SchoolController@index')->name('api.school.index');
Route::get('/school/{codDane}/surveys/{survey}', 'App\Http\Controllers\SurveyIndicatorController@show')->whereIn('survey', SurveyCatalog::slugs())->name('api.school.survey');
Route::get('/school/{codDane}/ciberseguridad', 'App\Http\Controllers\CiberseguridadController@show')->name('api.school.ciberseguridad');
Route::get('/school/{codDane}/saber11', 'App\Http\Controllers\Saber11Controller@show')->name('api.school.Saber11');
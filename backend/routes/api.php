<?php

use Illuminate\Support\Facades\Route;

Route::get('/school' , 'App\Http\Controllers\SchoolController@index')->name('api.school.index');


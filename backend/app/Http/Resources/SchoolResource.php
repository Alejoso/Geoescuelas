<?php 

namespace App\Http\Resources; 

use Illuminate\Http\Request; 
use Illuminate\Http\Resources\Json\JsonResource; 

class SchoolResource extends JsonResource 
{ 
    public function toArray(Request $request): array 
    {
        return [
            'dane'                         => $this->getDane(),
            'nombre'                       => $this->getNombre(),
            'coordinates' => [$this->getLatitud(), $this->getLongitud()],
            'numero_docentes_encuestados'  => $this->getNumeroDocentesEncuestados(),
            'indice_global_estudiantes'    => $this->getIndiceGlobalEstudiantes(),
            'indice_global_stem'           => $this->getIndiceGlobalStem(),
            'indice_global_docentes'       => $this->getIndiceGlobalDocentes(),
            'indice_global_ciberseguridad' => $this->getIndiceGlobalCiberseguridad(),
            'indice_global_icfes'          => $this->getIndiceGlobalIcfes(),
        ];
    }

} 
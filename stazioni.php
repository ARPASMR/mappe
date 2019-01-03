<?php

    if(substr_count($_SERVER['HTTP_HOST'], 'localhost')>0
        || substr_count($_SERVER['HTTP_HOST'], '192.168.')>0){
        $apiUrl = 'http://localhost/arpa/dbMeteo/';
    } else {
        $apiUrl = 'http://10.10.0.6/data_quality_management/';   // Sinergico
    }

    // ## Interrogazione API ##
    $response = file_get_contents($apiUrl.'api/stazioni.php');

    // ## Stampa dell'output in JSON ##
    header('Content-Type: application/json');
    print $response;
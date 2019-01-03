    var pathImmaginiFWI = 'fwi_img/';

    var layerFWI = null;

    /**
     *	Aggiunge alla mappa il layer FWI
     */
    function visualizzaLayerFWI(){
        switchLayerFWI();
    }
        function switchLayerFWI(){
            var giorno = $("select#selettoreGiorno").val();
            giorno = (giorno=='oggi' || giorno=='domani') ? 'LL_'+giorno : giorno;
            var nomeFile = 'fwi_'+giorno+'.png';
            // Rimuove layer se già esiste
            if(layerFWI!=null){
                layerFWI.setMap(null);
            }
            // Aggiunge il layer
            layerFWI = new google.maps.GroundOverlay(pathImmaginiFWI+nomeFile,
                new google.maps.LatLngBounds(
                    new google.maps.LatLng(44.45, 8.3),
                    new google.maps.LatLng(46.85, 11.5)
                ));
            layerFWI.setMap(mapOBJ);
            modificaOpacitaFWI();
        }
        
    /**
     *	Aggiunge alla mappa il layer AIB
     */
        function switchLayerAIB(clickedObj, giorno, indice){

            var grigliato = $("#selettoreGrigliato").val();

            $('.aibThumb td')
                .css('background-color','White')
                .css('border','1px solid White');
            $(clickedObj)
                .parent()
                .css('background-color','lightGrey')
                .css('border','1px solid Black');

            indice = (giorno=='oggi' || giorno=='domani') ? indice+'_LL' : indice;
            indice =  (grigliato=="medie") ? indice+'_AO' : indice;
            var nomeFile = indice+'_'+giorno+'.png';

            // Rimuove layer se già esiste
            if(layerFWI!=null){
                layerFWI.setMap(null);
            }
            // Aggiunge il layer
            layerFWI = new google.maps.GroundOverlay(pathImmaginiFWI+nomeFile,
                new google.maps.LatLngBounds(
                    new google.maps.LatLng(44.45, 8.3),
                    new google.maps.LatLng(46.85, 11.5)
                ));
            layerFWI.setMap(mapOBJ);
            modificaOpacitaFWI();
        }

        function switchGrigliato(){
            $('.aibThumb td').filter(function() {
                var match = 'rgb(211, 211, 211)'; // lightGrey
                return ($(this).css('background-color') == match );
            }).children("a").trigger("click");
        }


    /**
     *
     */
    function modificaOpacitaFWI(){
        var opacita = $("select#selettoreOpacita").val();
        layerFWI.setOpacity(parseFloat(opacita));
    }

    /**
     *  Inserisce sulla mappa i pannelli
     */
    function pannelliFWI(){
        // Posiziona il pannello del selettore della data
        $('div#pannello-FWI').css('left', 35).css('top', 5);
        // Aggiunge la scala
        $('#contenitoreMappa').append('<div id="pannello-scalaFWI" class="pannelloDiControllo"></div>');
        $('div#pannello-scalaFWI')
					.css('left', parseInt($('#mappaGoogle').css('width'))-150)
					.css('top', 55)
					.html('<img src="'+pathImmaginiFWI+'scala_fwi.png" />');
    }


    var etichetteAreeOmogenee = [];

    function layerAreeOmogenee(){
        // GeoJSON
        $(document).ready(function(){
            $.ajax({
                type: 'GET',
                url: "resources/areeOmogenee_centroidi.geojson",
                dataType : "json",
                success: function(json){
                    jQuery.each(json.features, function(i, val) {
                        var label = val.properties.codice;
                        var centroidGeom = val.geometry.coordinates;
                        var centroid = new google.maps.LatLng(centroidGeom[1],centroidGeom[0]);
                        var marker = new MarkerWithLabel({
                            position: centroid,
                            map: mapOBJ,
                            labelContent: label,
                            labelAnchor: new google.maps.Point(10, 0),
                            labelClass: "etichetteAreeOmogenee", // the CSS class for the label
                            icon: "resources/img/empty.png"
                        });
                        etichetteAreeOmogenee.push(marker);
                    });
                }
            });
        });
    }

        function switchLayerAreeOmogenee(obj){
           var visible = $(obj).prop("checked");
            jQuery.each(etichetteAreeOmogenee, function(i, val){
                val.setVisible(visible);
            });
        }

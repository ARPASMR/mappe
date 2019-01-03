	
	var mapOBJ;
	var lombardia = new google.maps.LatLng(45.7, 9.9);
	var geocoderOBJ = new google.maps.Geocoder();
		
	/**
	 *  Inizializza mappa Google centrata sulla Lombardia
	 */
		function inizializzaMappa() {
			
			// Attiva il nuovo look delle mappe Google
			google.maps.visualRefresh = true;
			
			// ### Configura opzioni mappa ###
			var mapOptions = {
				/* Stato iniziale */
				zoom: 8,
				minZoom: 6,
				center: lombardia,
				mapTypeId: google.maps.MapTypeId.TERRAIN,
				/* Controlli */
				disableDefaultUI: true,
				mapTypeControl: true,
			    mapTypeControlOptions: {
			      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
			    },
			    overviewMapControl: true,
				zoomControl: true,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.DEFAULT
				}
			};
			
			// ### Crea oggetto mappa ###
			mapOBJ = new google.maps.Map(document.getElementById('mappaGoogle'), mapOptions);
			
			// ### Aggiunge maschera confini lombardia ###
			layerConfiniLombardia();
			
		}
	
	
	/**
	 *  Genera una maschera che evidenzi i confini della Lombardia leggendo le coordinate da un file CSV
	 */
		function layerConfiniLombardia(){
			// legge coordinate da file CSV
			$(document).ready(function(){
				$.ajax({
					type: 'GET',
					url: "resources/confiniLombardia.csv",
					data: null,
					async: false,
					success: function(text){
						// coordinate Lombardia (da CSV) 
						var coordLombardia = new Array;
						var rows = text.split(/\n/);
						rows.pop(rows.length-1);
						for(var r=0; r<rows.length; r+=1){
							var columns = rows[r].split(',');
							coordLombardia.push(new google.maps.LatLng(columns[1], columns[0]));
						}
						// coordinate maschera
						var coordMaschera = [
						    new google.maps.LatLng(-90, -90),
						    new google.maps.LatLng(-90, 90),
						    new google.maps.LatLng(90, 90),
						    new google.maps.LatLng(90, -90)
						];
						// genera Layer e lo aggiunge alla mappa
						var layerConfini = new google.maps.Polygon({
						    paths: [coordMaschera, coordLombardia],
						    /* L'utilizzo di una maschera (a cui viene sottratto il poligono dei confini)
						     *  permette di oscurare tutto ciò che è al di fuori del'area di interesse anzichè agire 
						     *  direttamente su di essa evidenziandone i bordi.
						    */
						    strokeWeight: 0,
						    fillColor: "#000000",
						    fillOpacity: 0.4
						});
						layerConfini.setMap(mapOBJ);
					}
				});
			});
		}
	
	
	/**
	 *  Inserisce sulla mappa il pannello con il campo di inserimento per la ricerca delle località
	 */
		function pannelloDiRicerca(){
			// crea pannello di ricerca
			var contenutoPannello = '<span>Ricerca località <input type="text" style="width: 120px;" />&nbsp;</span><img src="resources/img/search.png" style="cursor: pointer;" />'; 
			$('div#contenitoreMappa').append('<div id="pannello-ricerca" class="pannelloDiControllo pannelloSfondoBianco"></div>');
			$('div#pannello-ricerca')
					.css('left', 35)
					.css('top', 42)
					.html(contenutoPannello);
			// associa eventi all'esecuzione della ricerca
			$('div#pannello-ricerca img').click(function(e){
				ricercaLocalita();
			});
			$('div#pannello-ricerca input').keyup(function(e){
			    if(e.keyCode == 13){
			    	ricercaLocalita();
			    }
			});
		}
	
		var popupRicerca = null;
		/**
		 *  Esegue la ricerca della località desiderata e posiziona un marker sulla mappa
		 */
			function ricercaLocalita(){
				var stringaDiRicerca = $('div#pannello-ricerca').find('input').val();
				if(stringaDiRicerca!=''){
					stringaDiRicerca += ", Lombardia, Italia";
					geocoderOBJ.geocode( { 'address': stringaDiRicerca}, function(results, status) {
						if(status==google.maps.GeocoderStatus.OK){
                            var posizione = results[0].geometry.location;

							// ### Marker ####
								// crea marker (se non esiste ancora)
								var markerRicerca = new google.maps.Marker({
									map: mapOBJ,
									zindex: 1000,
									optimized: false,
									icon: 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png'
								});
								// aggiorna posizione marker
								markerRicerca.setPosition(posizione);
							// ### InfoWindow ####
								var contenutoInfoWindow = '<div style="white-space: nowrap; min-width: 180px;">';
								contenutoInfoWindow += '<b>'+results[0].formatted_address+'</b><br />';
								contenutoInfoWindow += '<i>Lat</i>: '+posizione.lat()+'<br />';
								contenutoInfoWindow += '<i>Lon</i>: '+posizione.lng();
								contenutoInfoWindow += '</div>';
								// crea InfoWindow (se non esiste ancora)
								var infoRicerca = new google.maps.InfoWindow({
									zIndex: 1000
								});
								// aggiorna InfoWindow 
								infoRicerca.setContent(contenutoInfoWindow);
			    				infoRicerca.open(mapOBJ, markerRicerca);
			    				// chiudi InfoWindow aperte
			    				if(popupRicerca!=null){
			    					popupRicerca.close();
			    				}
			    				popupRicerca = infoRicerca;
						} else if(status==google.maps.GeocoderStatus.ZERO_RESULTS){
							alert('Località non trovata.');
						} else {
							alert('Errore nella richiesta a Google Geocoder');
						}
					});
				}
			}
	

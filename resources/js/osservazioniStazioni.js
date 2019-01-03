
	google.load('visualization', '1', {packages: ['corechart'], 'language': 'it'});
	
	/**
	 *	Visualizza il contenitore dei grafici delle osservazioni
	 *	@param	idStazione	{number}		ID della stazione
	 */	
 		function visualizzaContenitoreGrafici(idStazione){
 			$("input#idStazioneCorrente").val(idStazione);
 			$("#contenitoreOsservazioni").css("display", "inline-block");
 			// aggiorna le info della stazione e lo stato dei bottoni 
 			aggiornaInfoStazione(idStazione, $("div#infoStazione"));
 			aggiornaBottoniGrafici(idStazione);
 			// crea e visualizza il grafico selezionato
 			switchGraficoOsservazioni();
 		}
 		
 		/**
 		 *	Aggiorna le informazioni della stazione
	 	 *	@param	idStazione	{number}		ID della stazione
 		 */
 			function aggiornaInfoStazione(idStazione, contenitoreInfo){
 				var attributiStazione = attributiStazioni[idStazione];
 				var info = '<b>'+attributiStazione.nome+'</b><br />';
	 			info += '<i>quota: '+attributiStazione.quota+'</i><br />';
                contenitoreInfo.html(info);
 			}
 		
 		/**
 		 *	Aggiorna lo stato dei bottoni in base ai sensori presenti nella stazione
	 	 *	@param	idStazione	{number}		ID della stazione
 		 */
			function aggiornaBottoniGrafici(idStazione){
				$("button.selettoreGrafico").each(function(){
					var sensoriGrafico = $(this).val();
					if(stazioneHaSensore(idStazione, sensoriGrafico.charAt(0))==false 
						&& stazioneHaSensore(idStazione, sensoriGrafico.charAt(1))==false){
						$(this).addClass("disabled");
					} else {
						$(this).removeClass("disabled");
					}
				});
 			}
 			
		/** 
		 *  Verifica se una determinata stazione possiede una detminato sensore
	 	 *	@param	idStazione	{number}		ID della stazione
	 	 *	@param	sensore		{String}		sensore da verificare
		 */
			 function stazioneHaSensore(idStazione, sensore){
			 	var attributiStazione = attributiStazioni[idStazione];
				var sensoriStazione = attributiStazione.sensori;
				if(sensoriStazione.indexOf(sensore)>-1){
					return true;
				} 
				return false;
			 }
	 		
 		
 		/**
 		 *	Cambia il grafico visualizzato
	 	 *  @param	clickedButton	{Object}		il bottone cliccato
 		 */
 			function switchGraficoOsservazioni(clickedButton){
 				if(!$(clickedButton).hasClass('disabled')){
 					// aggiorna lo stato di selezione dei bottoni
	 				if($(clickedButton).hasClass('selettoreModalita')){
	 					$("button.selettoreModalita").removeClass("active");
	 				} else if($(clickedButton).hasClass('selettoreGrafico')){
	 					$("button.selettoreGrafico").removeClass("active");
	 				}
	 				$(clickedButton).addClass('active');
	 				// aggiorna il link al file CSV
	 				$("a#linkCSV").attr("href", ottieniUrlAPI('CSV'));
	 				// crea il grafico selezionato
	 				creaGraficoOsservazioni(document.getElementById('graficoStazione'));
 				}
 			}

			function ottieniUrlAPI(formato){
				var currentdate = new Date();
				var datetime = currentdate.getFullYear() + "-"
								+ (currentdate.getMonth()+1) + "-"
								+ currentdate.getDate() + "%20"
								+ currentdate.getHours() + ":00";
				var idStazione = $("input#idStazioneCorrente").val();
				var mode = $("button.selettoreModalita.active").val();
				return meteoAPI+'osservazioni.php?'
								+'formato='+formato
								+'&idStaz='+idStazione
								+'&modalita='+mode
								+'&data='+datetime;
			}
 		
	 	/**
 		 * Crea il grafico delle osservazioni con Google Charts. I dati delle osservazioni sono estratti da file CSV
 		 * 
 		 */
	 		function creaGraficoOsservazioni(contenitoreGrafico, tipoGrafico){

                if(typeof tipoGrafico == "undefined"){
                    tipoGrafico = $("button.selettoreGrafico.active").val();
                }
	 			var idStazione = $("input#idStazioneCorrente").val();

	 			var proprietaGrafico = definisciProprietaGrafico(tipoGrafico);

				$.ajax({
					type: 'GET',
					url: ottieniUrlAPI('JSON'),
					data: null,
					async: false,
					success: function(responseJSON){

						var num = proprietaGrafico.dati.length;
						
						var osservazioni = new google.visualization.DataTable();
						osservazioni.addColumn('datetime', 'ora');
						for (var c=0; c<num; c++) {
						  osservazioni.addColumn('number', proprietaGrafico.dati[c].etichetta);
                          osservazioni.addColumn({type: 'string', role: 'tooltip'});
						}

						// ottiene i dati delle ossevazioni
						var empty = true;
						for (var ora in responseJSON) {
							var datiOrari = [new Date(ora.replace(/-/g,"/"))];
							for (var c=0; c<num; c++) {
								var sensore = proprietaGrafico.dati[c].sensore;
								var value = null;
								var tooltipValue = proprietaGrafico.dati[c].etichetta+': No data';
								var jsonValue = responseJSON[ora][sensore];
								if(jsonValue!='-999.0'){
									value = parseFloat(jsonValue);
									tooltipValue = isNaN(jsonValue)
										? jsonValue
										: ( typeof(proprietaGrafico.dati[c].numeroDecimali)=="undefined"
											? jsonValue
											: parseFloat(jsonValue).toFixed(proprietaGrafico.dati[c].numeroDecimali)
										  );
									empty = false;
								}
								datiOrari.push(value);
								datiOrari.push(tooltipValue);
							}
							osservazioni.addRow(datiOrari);
						}

                        // Modifiche del grafico "Precipitazioni"
                        if(tipoGrafico=="PR"){
                            var modifiche = modificaGraficoPrecipitazioni(osservazioni, proprietaGrafico);
                            osservazioni = modifiche[0];
                            proprietaGrafico = modifiche[1];
                        }
                        // Modifiche del grafico "Vento"
                        if(tipoGrafico=='DV'){
                            proprietaGrafico = modificaGraficoVento_1(osservazioni, proprietaGrafico);
						}

						// genera il grafico richiesto
                        if(empty==false &&
                        		!(stazioneHaSensore(idStazione, tipoGrafico.charAt(0))==false 
								&& stazioneHaSensore(idStazione, tipoGrafico.charAt(1))==false)){
                            var chart = new google.visualization.ComboChart(contenitoreGrafico);
                            chart.draw(osservazioni, proprietaGrafico);
                        } else {
                            contenitoreGrafico.innerHTML = '';
                        }

						if(tipoGrafico=='DV'){
                            modificaGraficoVento_2();
						}
					}
				});
	 		}

                /**
                 * Apporta alcune modifiche al grafico delle PRECIPITAZIONI
                 * @param {Object} osservazioni
                 * @param {Object} proprietaGrafico
                 */
                    function modificaGraficoPrecipitazioni(osservazioni, proprietaGrafico){

                        var mode = $("button.selettoreModalita.active").val();

                        if(mode=='24h'){
                            // Rimpiazza valori pioggia instantanea con pioggia cumulata
                            var sum  = 0,
                                max = 0;
                            var numRows = osservazioni.getNumberOfRows();
                            for(var r=0; r<numRows; r++){
                                var value = osservazioni.getValue(r, 3);
                                if(value!='-999.0'){
                                    sum += value;
                                    max = (value>max) ? value : max;
                                }
                                osservazioni.setValue(r, 5, sum);
                                osservazioni.setValue(r, 6, String(sum));
                            }
                            // per valori < 10mm setta la scala max a 10mm
                            max = (sum>max) ? sum : max;
                            if(max<=10){
                                proprietaGrafico.vAxes[1].viewWindow.max = 10;
                            }
                        } else {
                            // rimuovi colonne relative alla pioggia cumulata per i meteogrammi settimanali
                            osservazioni.removeColumn(6);
                            osservazioni.removeColumn(5);
                        }

                        return [osservazioni, proprietaGrafico];
                    }
                /**
                 * Apporta alcune modifiche al grafico del VENTO
                 * @param {Object} osservazioni
                 * @param {Object} proprietaGrafico
                 */
                    function modificaGraficoVento_1(osservazioni, proprietaGrafico){
                        // se VVS tutto null converte VV da line a 'area'
                        var numRows = osservazioni.getNumberOfRows();
                        var empty = true;
                        for(r=0; r<numRows; r++){
                            var value = osservazioni.getValue(r, 3);
                            if(value!=null){
								empty = false;
							}
						}
						if(empty==true){
							proprietaGrafico.series[3].type = 'area';
							proprietaGrafico.series[3].areaOpacity = 0.7;
						}
                        proprietaGrafico.vAxes[0].ticks = [
                                                            { v: 0, f: 'N' },
                                                            { v: 90, f: 'E' },
                                                            { v: 180, f: 'S' },
                                                            { v: 270, f: 'W' },
                                                            { v: 360, f: 'N' }
                                                        ];
						return proprietaGrafico;
                    }
                    function modificaGraficoVento_2(){
                        // sostituisce le etichette dell'asse verticale
                        $('svg text[text-anchor="end"]').text(function(j,t){
                            if(t=="0" || t=="360"){
                                return "N";
                            } else if(t=="90"){
                                return "E";
                            } else if(t=="180"){
                                return "S";
                            } else if(t=="270"){
                                return "W";
                            }
                        });
                    }

	 			/**
	 			 * Definisce le proprietà del grafico per ciascuna variabile 
				 * @param {Object} proprietaGrafico
				 * @param {Object} tipoGrafico
				 */
                    function definisciProprietaGrafico(tipoGrafico){

                        var mode = $("button.selettoreModalita.active").val();

                        var proprietaGrafico = {
                            width: 460,
                            height: 200,
                            chartArea: { width: '80%',
                                         height: '75%'
                                        },
                            legend: { position: 'none' },
                            hAxis: { format: ((mode=='24h') ? 'HH' : 'EEE') },
                            vAxes: { 0:{},	// Asse SX
                                     1:{} 	// Asse DX
                                   },
                            series:[],
                            focusTarget: 'category',
                            dati: []	// definito per contenere informazioni aggiuntive relative ai dati delle osservazioni
                        };

                        $.ajax({
                            dataType: "json",
                            url: 'resources/meteogrammi.json',
                            async: false,
                            success: function(responseJSON){
                                for(index in responseJSON['meteogrammi']){
                                    if(responseJSON['meteogrammi'][index]['grafico']==tipoGrafico){
                                        var variabili = responseJSON['meteogrammi'][index]['variabili'];
                                        var numVariables = variabili.length;
                                        for(var i=0; i<numVariables; i++){
                                            var parametri = variabili[i];

                                            // ## Definisce dati generici  ##
                                            if(i<=1){
                                                proprietaGrafico.dati[i] = {
                                                    'etichetta': parametri['etichetta'],
                                                    'numeroDecimali': parametri['decimali'],
                                                    'sensore': parametri['sensore']
                                                };
                                            } else {
                                                if(!(typeof parametri['etichetta']==='undefined')
                                                    || !(typeof parametri['decimali']==='undefined')
                                                    || !(typeof parametri['sensore']==='undefined')) {
                                                    proprietaGrafico.dati[i] = {};
                                                }
                                                if(!(typeof parametri['etichetta']==='undefined')) {
                                                    proprietaGrafico.dati[i]['etichetta'] = parametri['etichetta'];
                                                }
                                                if(!(typeof parametri['decimali']==='undefined')) {
                                                    proprietaGrafico.dati[i]['numeroDecimali'] = parametri['decimali'];
                                                }
                                                if(!(typeof parametri['sensore']==='undefined')) {
                                                    proprietaGrafico.dati[i]['sensore'] = parametri['sensore'];
                                                }
                                            }

                                            // ## Definisce caratteristiche serie dati ##
                                            proprietaGrafico.series[i] = {
                                                'targetAxisIndex': i,
                                                'color': parametri['colore'],
                                                'type': parametri['tipo']
                                            };
                                            if(parametri['tipo']=='area'){
                                                proprietaGrafico.series[i]['areaOpacity'] = 0.7;
                                            } else if(parametri['tipo']=='scatter'){
                                                proprietaGrafico.series[i]['pointSize'] = 4;
                                            }
                                            if(i>1){
                                                proprietaGrafico.series[i]['targetAxisIndex'] = parametri['asse'];
                                            }

                                            // ## Definisce caratteristiche asse verticale ##
                                            proprietaGrafico.vAxes[i] = {
                                                'title': parametri['nome'],
                                                'gridlines': {count: 6, color: '#ffffff'},
                                                'titleTextStyle': {color: parametri['colore']},
                                                'textStyle': {color: parametri['colore']}
                                            };
                                            if(parametri['tipo']=='area'){
                                                proprietaGrafico.vAxes[i]['viewWindowMode'] ='pretty';
                                            }
                                            if( ('minimo' in parametri) && ('massimo' in parametri) ) {
                                                proprietaGrafico.vAxes[i]['viewWindow'] = { "min": parametri['minimo'], "max": parametri['massimo'] };
                                            } else if( 'minimo' in parametri ){
                                                proprietaGrafico.vAxes[i]['viewWindow'] = { "min": parametri['minimo'], "max": 'auto' };
                                            } else if( 'massimo' in parametri ){
                                                proprietaGrafico.vAxes[i]['viewWindow'] = { "min": 'auto', "max": parametri['massimo'] };
                                            }

                                        }

                                    }
                                }
                            }
                        });

                        return proprietaGrafico;
                    }

 	var finestraMeteogramma;
	/**
	 *	Apre finestra popup con il metegramma 
	 *	@param	event	{event}
	 */	
	    function apriMeteogramma(event){
	        // apri finestra popup
	        if(finestraMeteogramma == null || finestraMeteogramma.closed) {
	            finestraMeteogramma =  window.open('', '_blank', 'width=500,height=600,scrollbars=yes,location=no');
	        }
	        // crea finestra popup
	        var meteogramma = '<!DOCTYPE html>' +
                                '<html>' +
                                '   <head>' +
                                '       <title>ARPA Lombardia - Rete di monitoraggio</title>' +
                                '       <script type="text/javascript" src="https://www.google.com/jsapi"></script>' +
                                '       <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>' +
                                '    </head>' +
                                '   <body>' +
                                '        <div id="meteogrammaPopup">' +
                                '           <div id="meteogrammaInfo"></div>' +
                                '           <div id="meteogrammaPR"></div>' +
                                '           <div id="meteogrammaTU"></div>' +
                                '           <div id="meteogrammaTU"></div>' +
                                '           <div id="meteogrammaDV"></div>' +
                                '           <div id="meteogrammaGN"></div>' +
                                '           <div id="meteogrammaNV"></div>' +
                                '       </div>' +
                                '   </body>' +
                                '</html>';
	        $(finestraMeteogramma.document.body).html(meteogramma);
            aggiornaInfoStazione($("input#idStazioneCorrente").val(), $("div#meteogrammaInfo", finestraMeteogramma.document));
            creaGraficoOsservazioni(finestraMeteogramma.document.getElementById('meteogrammaPR'), 'PR');
            creaGraficoOsservazioni(finestraMeteogramma.document.getElementById('meteogrammaTU'), 'TU');
            creaGraficoOsservazioni(finestraMeteogramma.document.getElementById('meteogrammaDV'), 'DV');
            creaGraficoOsservazioni(finestraMeteogramma.document.getElementById('meteogrammaGN'), 'GN');
            creaGraficoOsservazioni(finestraMeteogramma.document.getElementById('meteogrammaNV'), 'NV');

	        event.preventDefault ? event.preventDefault() : event.returnValue = false;
	        return false;
	    }

        function inizializzaMeteogramma(idStazione, mode){
            visualizzaContenitoreGrafici(idStazione);
            if(mode=="24h"){
                $("#selettoreModalita24h").click();
            } else if(mode=="7gg"){
                $("#selettoreModalita7gg").click();
            }
            apriMeteogramma(event);
        }

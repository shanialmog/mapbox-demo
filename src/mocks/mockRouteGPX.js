import togeojson from 'togeojson'

const convertedGPX = togeojson.gpx(new DOMParser().parseFromString(
    `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="FME(R) 2014 SP5">
	<metadata>
		<time>2016-04-27T15:17:02+01:00</time>
		<bounds minlat="48.57697573087804" minlon="-3.9874913352415757" maxlat="48.726304979176675" maxlon="-3.8264762610046783"/>
	</metadata>
	<trk>
		<name>1_Roscoff_Morlaix_A</name>
		<trkseg>
			<trkpt lat="48.726304979176675" lon="-3.9829935637739382">
				<ele>5.3000000000029104</ele>
			</trkpt>
			<trkpt lat="48.72623035828412" lon="-3.9829726446543385">
				<ele>4.6999999999970896</ele>
			</trkpt>
			<trkpt lat="48.726126671101639" lon="-3.9829546542797467">
				<ele>5.1999999999970896</ele>
			</trkpt>
			<trkpt lat="48.725965124843256" lon="-3.9829070729298808">
				<ele>5.6999999999970896</ele>
			</trkpt>
			<trkpt lat="48.725871429380568" lon="-3.9828726793245273">
				<ele>5.5</ele>
			</trkpt>
			<trkpt lat="48.725764250990267" lon="-3.9828064532306628">
				<ele>5.6999999999970896</ele>
			</trkpt>
			<trkpt lat="48.725679557682362" lon="-3.9827385375789146">
				<ele>5.6098999999958323</ele>
			</trkpt>
			<trkpt lat="48.72567025076134" lon="-3.9827310750289113">
				<ele>5.6000000000058208</ele>
			</trkpt>
			<trkpt lat="48.725529844164292" lon="-3.9826617613709225">
				<ele>0</ele>
			</trkpt>
			<trkpt lat="48.725412537198615" lon="-3.9826296635284164">
				<ele>0</ele>
			</trkpt>
			<trkpt lat="48.725351694726704" lon="-3.9826201452878531">
				<ele>0</ele>
			</trkpt>
			<trkpt lat="48.725258599474508" lon="-3.9826063049230411">
				<ele>0</ele>
			</trkpt>
			<trkpt lat="48.725157520450125" lon="-3.9825900299314232">
				<ele>0</ele>
			</trkpt>
			<trkpt lat="48.725077863838543" lon="-3.9825779905509102">
				<ele>0</ele>
			</trkpt>
            </trkseg>
	    </trk>
</gpx>`, "application/xml"))

const mockRouteGPX = {
    'type': 'geojson',
    'data': convertedGPX.features[0]
}

export default mockRouteGPX

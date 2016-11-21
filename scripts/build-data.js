// MapIt importer script and GeoJson builder.
const edinburghcityscopeUtils = require('edinburghcityscope-utils');
const fs = require('fs');
const path = require('path');
const queue = require('queue');
const _ = require('lodash');
const ProgressBar = require('progress');

const datadir = path.join(__dirname, '..', 'data');
const dataZones2011GeoJsonFile = 'data-zones-2011.geojson';
const csvFilename = 'simd-2016.csv';

var zones2011 = [];
var dataZones = {
    type: "FeatureCollection",
    features: [],
};

// Fetch 2011 datazones
edinburghcityscopeUtils.fetchGovBoundaries('dz-2011', (err, boundaries, zones) => {
    if (err) throw err;

    zones2011 = zones
    dataZones.features = boundaries;
    fs.writeFileSync(path.join(datadir, dataZones2011GeoJsonFile), JSON.stringify(dataZones), 'utf8');
    console.log('DZ-2011 area collection GeoJSON file saved to ' + dataZones2011GeoJsonFile);

    interrogateSPARQL(zones2011)
});

function interrogateSPARQL(zones) {
    var queries = [];
    var batch = queue({concurrency: 1});
    var chunk_size = 1;
    var records = [];
    var fields = [];

    console.log();
    var bar = new ProgressBar('  API calls :bar :percent :etas', {
        complete: '█',
        incomplete: '─',
        width: 55,
        total: Math.ceil(zones.length / chunk_size)
    });

    var fetchChunk = function(done) {
        var query = queries.shift();

        edinburghcityscopeUtils.getScotGovSPARQL(query, (err, rows, columns) => {
            if (err) throw err;

            fields = columns;
            records.push(...rows);

            bar.tick();
            done();
        });
    }

    var outputRecords = function() {
        var json2csv = require('json2csv')
        var csv = json2csv({data: records, fields: fields, newLine: "\n"})
        fs.writeFileSync(path.join(datadir, csvFilename), csv)
    }

    console.log(`Fetching data for ${zones.length} zones, ${chunk_size} at a time...`)
    bar.tick(0);
    _.forEach(_.chunk(zones, chunk_size), (zone_chunk) => {
        queries.push(`
            PREFIX qb: <http://purl.org/linked-data/cube#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ldim: <http://purl.org/linked-data/sdmx/2009/dimension#>
            PREFIX dim: <http://statistics.gov.scot/def/dimension/>
            PREFIX area: <http://statistics.gov.scot/id/statistical-geography/>
            PREFIX data: <http://statistics.gov.scot/data/>
            
            SELECT ?year ?zone ?domain ?measure ?value
            WHERE {
                ?s qb:dataSet data:scottish-index-of-multiple-deprivation-2016 ;
                   qb:measureType ?m ;
                   ?m ?value ;
                   dim:simdDomain ?d ;
                   ldim:refArea ?z ;
                   ldim:refPeriod ?y .
                ?z rdfs:label ?zone .
                ?d rdfs:label ?domain .
                ?y rdfs:label ?year .
                ?m rdfs:label ?measure .
                FILTER ( ?z IN (
                    ${zone_chunk.map(zone => `<${zone}>`).join(', ')}
                ))
            }`);

        batch.push(fetchChunk);
    });

    batch.push(outputRecords);

    batch.on('timeout', function(next, job) {
        console.log('Batched fetch from SPARQL timed out!');
        next();
    });

    batch.start();
}

edinburghcityscopeUtils.updateDataModificationDate(path.join(__dirname, '..'));

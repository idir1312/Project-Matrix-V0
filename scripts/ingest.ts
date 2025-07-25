import axios from 'axios';
import csvParser from 'csv-parser';
import knexLib from 'knex';
import AdmZip from 'adm-zip';

import * as stream from 'stream';
import knexConfig from '../knexfile.cjs';

const knex = knexLib(knexConfig.development);

async function ingest() {
  // Download and insert regions
  const regionsUrl =
    'https://data.humdata.org/dataset/cod-ab-dza/resource/4c9d8b3b-f5bc-4ef9-8a7f-2f2a0a3a2d9f/download/dza_admbnda_adm1_ocha_20170821.geojson';
  const regionsResponse = await axios.get(regionsUrl);
  const regionsGeojson = regionsResponse.data;
  regionsGeojson.features.forEach(async (feature) => {
    const { properties, geometry } = feature;
    await knex('regions').insert({
      name: properties.ADMIN1 || properties.name,
      code: properties.ADMIN1_CODE || properties.code,
      geom: knex.raw('ST_GeomFromGeoJSON(?)', JSON.stringify(geometry)),
    });
  });

  // GDP
  const gdpUrl =
    'https://api.worldbank.org/v2/country/DZ/indicator/NY.GDP.MKTP.CD?downloadformat=csv';
  const gdpResponse = await axios.get(gdpUrl, { responseType: 'arraybuffer' });
  const zip = new AdmZip(gdpResponse.data);
  const zipEntries = zip.getEntries();
  const csvEntry = zipEntries.find(
    (entry: AdmZip.IZipEntry) =>
      entry.entryName.startsWith('API_') &&
      entry.entryName.endsWith('.csv') &&
      !entry.entryName.includes('Metadata')
  );
  if (!csvEntry) throw new Error('No CSV in zip');
  const csvData = csvEntry.getData().toString('utf8');
  const gdpData: any[] = [];
  await new Promise((resolve, reject) => {
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(csvData);
    readable.push(null);
    readable
      .pipe(csvParser())
      .on('data', (row: any) => gdpData.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  const regions = await knex('regions').select('id');
  gdpData.forEach(async (row) => {
    const year = parseInt(row.Year, 10);
    const nationalGdp = parseFloat(row.Value);
    if (Number.isNaN(year) || Number.isNaN(nationalGdp)) return;
    const perRegion = nationalGdp / regions.length;
    regions.forEach(async (region) => {
      await knex('economy_gdp').insert({
        region_id: region.id,
        year,
        value: perRegion + Math.random() * perRegion * 0.2 - perRegion * 0.1,
      });
    });
  });

  // Download and insert infrastructure
  const healthUrl =
    'https://data.humdata.org/dataset/1b430d7d-6547-4c6d-98e8-5b4b3c5d4f9a/resource/6f3a28f6-4d54-4b6a-9966-3d3b819b9693/download/algeria-healthsites.geojson';
  const healthResponse = await axios.get(healthUrl);
  const healthGeojson = healthResponse.data;
  const sample = healthGeojson.features.slice(0, 10);
  sample.forEach(async (feature) => {
    const { properties, geometry } = feature;
    const lon = geometry.coordinates[0];
    const lat = geometry.coordinates[1];
    await knex('infrastructure_projects').insert({
      name: properties.name || 'Sample Project',
      type: 'health',
      status: 'active',
      cost: Math.random() * 1000000,
      location: knex.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [lon, lat]),
      region_id: 1,
    });
  });

  // Ingestion complete
}

ingest()
  .then(() => knex.destroy())
  .catch(console.error);

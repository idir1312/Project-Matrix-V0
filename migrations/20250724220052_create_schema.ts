import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('regions', (table) => {
    table.increments('id').primary();
    table.text('name');
    table.text('code');
    table.specificType('geom', 'geometry(MultiPolygon, 4326)');
  });

  await knex.schema.createTable('economy_gdp', (table) => {
    table.increments('id').primary();
    table.integer('region_id').references('regions.id');
    table.integer('year');
    table.decimal('value');
    table.timestamp('ts').defaultTo(knex.fn.now());
  });

  await knex.raw("SELECT create_hypertable('economy_gdp', 'ts');");

  await knex.schema.createTable('infrastructure_projects', (table) => {
    table.increments('id').primary();
    table.text('name');
    table.text('type');
    table.text('status');
    table.decimal('cost');
    table.specificType('location', 'geometry(Point, 4326)');
    table.integer('region_id').references('regions.id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('infrastructure_projects');
  await knex.schema.dropTable('economy_gdp');
  await knex.schema.dropTable('regions');
}

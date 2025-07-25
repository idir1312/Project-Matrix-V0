import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS timescaledb;');
}

export async function down(knex: Knex) {
  await knex.raw('DROP EXTENSION IF EXISTS postgis;');
  await knex.raw('DROP EXTENSION IF EXISTS timescaledb;');
}

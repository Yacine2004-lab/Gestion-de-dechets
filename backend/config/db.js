// config/db.js
const { Sequelize } = require('sequelize');
const { Client } = require('pg');
const path = require('path');

// .env est dans backend/ (même dossier que server.js)
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const dbName = process.env.DB_NAME || 'gestion_dechets';

async function ensureDatabaseExists() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de données "${dbName}" créée.`);
    }
  } finally {
    await client.end();
  }
}

const sequelize = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT,
  logging: false,
});

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie !');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error.message || error);
  }
};

module.exports = { sequelize, connectDB };

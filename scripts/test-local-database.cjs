#!/usr/bin/env node
"use strict";

const { execFileSync } = require("node:child_process");
const os = require("node:os");
const path = require("node:path");

const binaries = process.env.COMECORE_PG_BIN || "/Applications/Postgres.app/Contents/Versions/18/bin";
const socket = process.env.COMECORE_PG_SOCKET || path.join(os.homedir(), "Library/Application Support/ComeCore/PostgreSQL18/socket");
const database = process.env.COMECORE_DB_NAME || "comecore";
const username = process.env.COMECORE_PG_ADMIN || os.userInfo().username;
const checks = path.resolve(__dirname, "../database/checks/003_local_rls_checks.sql");
const environment = { ...process.env };
delete environment.PGPASSWORD;

try {
  execFileSync(path.join(binaries, "psql"), [
    "-X", "--no-password", "-v", "ON_ERROR_STOP=1",
    "-h", socket, "-p", "5432", "-U", username, "-d", database, "-f", checks,
  ], { env: environment, stdio: "inherit" });
  console.log("Pruebas SQL locales completadas; no se conservaron datos de prueba.");
} catch {
  console.error("Falló una comprobación SQL local. Revise el error anterior; no se confirmó la transacción de prueba.");
  process.exitCode = 1;
}

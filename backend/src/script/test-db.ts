// scripts/test-db.ts
// src/script/test-db.ts
import "dotenv/config";
import dns from "dns/promises";
import net from "net";
import { pool } from "../db/db.js";
import { env } from "../config/env.js";
// import { unknown } from "zod";

/**
 * Mask password in a connection string for safe logging
 */
function maskConnectionString(conn: string) {
  try {
    const u = new URL(conn);
    if (u.password) u.password = "********";
    return u.toString();
  } catch {
    // fallback: don't crash if not a valid URL
    return conn.replace(/:(.*?)@/, ":********@");
  }
}

async function tryTcpConnect(host: string, port: number, timeout = 3000) {
  return new Promise<void>((resolve, reject) => {
    const socket = new net.Socket();
    const onError = (err: Error) => {
      socket.destroy();
      reject(err);
    };
    socket.setTimeout(timeout, () => onError(new Error(`TCP connect timeout after ${timeout}ms`)));
    socket.once("error", onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });
}

async function main() {
  console.log("=== DB DIAGNOSTICS START ===");

  const dbUrl = env.DATABASE_URL ?? process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL not found in env.");
    process.exit(1);
  }

  console.log("DATABASE_URL (masked):", maskConnectionString(dbUrl));

  // parse host/port with URL class (works for postgres/postgresql)
  try {
    const u = new URL(dbUrl);
    const host = u.hostname;
    const port = Number(u.port || 5432);
    const user = u.username || "(none)";
    const database = u.pathname ? u.pathname.replace(/^\//, "") : "(none)";

    console.log(`Parsed values -> host: ${host}, port: ${port}, user: ${user}, database: ${database}`);

    // 1) DNS lookup
    try {
      console.log(`\n[1] DNS lookup for host: ${host}`);
      const lookup = await dns.lookup(host);
      console.log(`[OK] DNS: ${host} -> ${lookup.address} (family ${lookup.family})`);
    } catch (dnsErr) {
      console.error("[FAIL] DNS lookup failed:", dnsErr);
      console.error(" -> This usually means the hostname is wrong or your network can't resolve it.");
      throw dnsErr;
    }

    // 2) TCP connect to host:port
    try {
      console.log(`\n[2] TCP connect to ${host}:${port} (3s timeout)`);
      await tryTcpConnect(host, port, 3000);
      console.log(`[OK] TCP connect to ${host}:${port} succeeded`);
    } catch (tcpErr) {
      console.error("[FAIL] TCP connect failed:", tcpErr.message ?? tcpErr);
      console.error(" -> This can be caused by firewall, blocked outbound port, or wrong port in the URL.");
      throw tcpErr;
    }

  } catch (parseErr) {
    console.error("ERROR parsing DATABASE_URL:", parseErr);
    throw parseErr;
  }

  // 3) Run a real DB query using your pool
  try {
    console.log("\n[3] Running a simple query with pg Pool: SELECT 1 as ok");
    const { rows } = await pool.query("SELECT 1 as ok");
    console.log("[OK] Query result:", rows);
  } catch (pgErr) {
    console.error("[FAIL] Postgres query failed (full error):");
    console.error(pgErr && pgErr.stack ? pgErr.stack : pgErr);
    throw pgErr;
  } finally {
    try {
      await pool.end();
    } catch {
      // ignore
    }
    console.log("=== DB DIAGNOSTICS END ===");
  }
}

main().catch((err) => {
  console.error("\nScript finished with error." , err);
  // The error has already been printed above; exit with failure code so CI / scripts know it's failed
  process.exit(1);
});

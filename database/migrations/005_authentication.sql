-- Esquema generado por Better Auth 1.7.7; identidad/sesiones/MFA de biblioteca mantenida.
BEGIN;
CREATE ROLE comecore_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE SCHEMA authn AUTHORIZATION comecore_owner;
CREATE SCHEMA security AUTHORIZATION comecore_owner;
REVOKE ALL ON SCHEMA authn,security FROM PUBLIC;
GRANT USAGE ON SCHEMA authn,security,app_private TO comecore_auth;
GRANT CONNECT ON DATABASE comecore TO comecore_auth;
SET LOCAL search_path=authn,pg_catalog;
create table "user" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null, "twoFactorEnabled" boolean);

create table "session" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" uuid not null references "user" ("id") on delete cascade);

create table "account" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "accountId" text not null, "providerId" text not null, "userId" uuid not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "verification" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "twoFactor" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "secret" text not null, "backupCodes" text not null, "userId" uuid not null references "user" ("id") on delete cascade, "verified" boolean, "failedVerificationCount" integer, "lockedUntil" timestamptz);

create table "rateLimit" ("id" uuid default pg_catalog.gen_random_uuid() not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");

create index "twoFactor_secret_idx" on "twoFactor" ("secret");

create index "twoFactor_userId_idx" on "twoFactor" ("userId");
CREATE TABLE security.account_flags (
 user_id uuid PRIMARY KEY REFERENCES authn."user"(id) ON DELETE CASCADE,
 must_change_password boolean NOT NULL DEFAULT false, temporary_expires_at timestamptz
);
CREATE TABLE security.session_assurance (
 session_id uuid PRIMARY KEY REFERENCES authn.session(id) ON DELETE CASCADE,
 reauthenticated_at timestamptz NOT NULL
);
CREATE TABLE security.factor_replays (
 user_id uuid NOT NULL REFERENCES authn."user"(id) ON DELETE CASCADE,
 code_fingerprint char(64) NOT NULL, expires_at timestamptz NOT NULL,
 PRIMARY KEY(user_id,code_fingerprint)
);
CREATE TABLE security.attempt_buckets (
 key char(64) NOT NULL, window_start timestamptz NOT NULL, count integer NOT NULL CHECK(count>0),
 PRIMARY KEY(key,window_start)
);
CREATE TABLE security.events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_type varchar(80) NOT NULL,
 actor_id uuid REFERENCES authn."user"(id) ON DELETE SET NULL,
 success boolean NOT NULL, source_fingerprint char(64), occurred_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX factor_replays_expiry ON security.factor_replays(expires_at);
CREATE INDEX attempts_expiry ON security.attempt_buckets(window_start);
CREATE INDEX security_events_actor ON security.events(actor_id,occurred_at DESC);
CREATE INDEX session_expiry ON authn.session("expiresAt");
CREATE INDEX verification_expiry ON authn.verification("expiresAt");
CREATE UNIQUE INDEX authn_users_email_normalized ON authn."user"(lower(email));
CREATE UNIQUE INDEX authn_credential_unique ON authn.account("providerId","accountId");
CREATE UNIQUE INDEX authn_two_factor_user_unique ON authn."twoFactor"("userId");
ALTER TABLE authn.account ADD CONSTRAINT credential_hash_required CHECK("providerId"<>'credential' OR password ~ '^\$argon2id\$');
ALTER TABLE iam.app_users ADD CONSTRAINT app_users_external_auth_fk FOREIGN KEY(external_auth_id) REFERENCES authn."user"(id) ON DELETE SET NULL;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA authn TO comecore_auth;
GRANT SELECT,INSERT,UPDATE,DELETE ON security.account_flags,security.session_assurance,security.factor_replays,security.attempt_buckets TO comecore_auth;
GRANT INSERT ON security.events TO comecore_auth;
GRANT USAGE ON SEQUENCE security.events_id_seq TO comecore_auth;
DO $owners$ DECLARE item record; BEGIN
 FOR item IN SELECT n.nspname,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('authn','security') AND c.relkind='r' LOOP
 EXECUTE format('ALTER TABLE %I.%I OWNER TO comecore_owner',item.nspname,item.relname);
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',item.nspname,item.relname);
 EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',item.nspname,item.relname);
 IF item.relname='events' AND item.nspname='security' THEN
 EXECUTE format('CREATE POLICY service_insert ON %I.%I FOR INSERT TO comecore_auth WITH CHECK(true)',item.nspname,item.relname);
 ELSE
 EXECUTE format('CREATE POLICY service_only ON %I.%I TO comecore_auth USING(true) WITH CHECK(true)',item.nspname,item.relname);
 END IF;
 END LOOP;
END $owners$;
CREATE FUNCTION app_private.resolve_operator(authenticated_subject uuid)
RETURNS TABLE(user_id uuid,display_name varchar,organization_id uuid,organization_name varchar,role varchar)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $body$
 SELECT u.id,u.display_name,o.id,o.name,m.role FROM iam.app_users u
 JOIN iam.organization_memberships m ON m.user_id=u.id JOIN iam.organizations o ON o.id=m.organization_id
 WHERE u.external_auth_id=authenticated_subject AND u.status='active' AND m.status='active' AND o.status='active'
 ORDER BY o.created_at,o.id LIMIT 1
$body$;
ALTER FUNCTION app_private.resolve_operator(uuid) OWNER TO comecore_policy;
REVOKE ALL ON FUNCTION app_private.resolve_operator(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.resolve_operator(uuid) TO comecore_auth;
COMMENT ON SCHEMA authn IS 'Better Auth: acceso reservado al servicio, ninguna credencial llega al navegador';
COMMENT ON SCHEMA security IS 'Controles de seguridad: intentos, reautenticación, antirreplay y eventos sin secretos';
COMMENT ON TABLE security.account_flags IS 'Alta temporal local: exige cambio antes de MFA/ERP; rechazada al publicar';
COMMIT;

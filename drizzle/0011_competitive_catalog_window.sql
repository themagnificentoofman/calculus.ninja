-- Migration 0011 requires the singleton control to be closed before it installs the catalog window.
-- SQLite evaluates this expression only for a row matching the partial index. Its documented
-- integer overflow aborts that migration batch, including the journal receipt.
CREATE INDEX round_migration_0011_require_closed ON round_authorization_control (abs(-9223372036854775808))
WHERE enabled<>0 OR writing<>0 OR gc_active<>0;
--> statement-breakpoint
DROP INDEX round_migration_0011_require_closed;
--> statement-breakpoint
CREATE TRIGGER round_competitive_writer_closed_insert BEFORE INSERT ON round_authorization_control
WHEN NEW.writing<>0 OR NEW.enabled<>0
BEGIN SELECT RAISE(ABORT, 'Install a closed catalog first'); END;
--> statement-breakpoint
CREATE TRIGGER round_competitive_writer_closed_update BEFORE UPDATE ON round_authorization_control
WHEN (NEW.writing=1 AND (OLD.enabled=1 OR NEW.enabled=1))
  OR (NEW.enabled=1 AND OLD.writing=1)
  OR (OLD.enabled=1 AND NEW.enabled=1 AND
      (NEW.control_version<>OLD.control_version OR NEW.epoch<>OLD.epoch))
BEGIN SELECT RAISE(ABORT, 'Close creation before changing the catalog'); END;
--> statement-breakpoint
-- Code using the new protocol cannot capture an earlier schema by accident.
CREATE VIEW round_competitive_catalog_window AS
SELECT control_version AS version, epoch, lower(hex(incarnation)) AS incarnation,
       lower(hex(policy_hash)) AS policyHash
FROM round_authorization_control
WHERE id=1 AND enabled=1 AND writing=0 AND gc_active=0;

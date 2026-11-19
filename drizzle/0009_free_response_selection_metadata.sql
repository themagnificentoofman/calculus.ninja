-- Additive immutable metadata for reviewed FR selection. No activation pointer.
CREATE TABLE frbank_selection_metadata (
 record_ref INTEGER PRIMARY KEY REFERENCES frbank_records(record_ref),
 record_hash BLOB NOT NULL CHECK(length(record_hash)=32),
 idea TEXT NOT NULL, structure TEXT NOT NULL, technique TEXT NOT NULL, combination TEXT NOT NULL,
 source_release_id TEXT, source_family_id TEXT, source_difficulty TEXT,
 source_problem_id TEXT, source_revision INTEGER, source_content_hash TEXT,
 CHECK((source_release_id IS NULL AND source_family_id IS NULL AND source_difficulty IS NULL AND source_problem_id IS NULL AND source_revision IS NULL AND source_content_hash IS NULL)
  OR (source_release_id IS NOT NULL AND source_family_id IS NOT NULL AND source_difficulty IS NOT NULL AND source_problem_id IS NOT NULL AND source_revision IS NOT NULL AND source_revision>0 AND source_content_hash IS NOT NULL AND length(source_content_hash)=64))
);
--> statement-breakpoint
CREATE TRIGGER frbank_metadata_no_replace BEFORE INSERT ON frbank_selection_metadata
 WHEN EXISTS(SELECT 1 FROM frbank_selection_metadata old WHERE old.record_ref=NEW.record_ref)
 BEGIN SELECT RAISE(ABORT,'Retain immutable FR selection metadata'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_metadata_bound BEFORE INSERT ON frbank_selection_metadata
 WHEN NOT EXISTS(SELECT 1 FROM frbank_records r WHERE r.record_ref=NEW.record_ref AND r.record_hash=NEW.record_hash
  AND (r.mc_problem_ref IS NULL)=(NEW.source_release_id IS NULL))
 BEGIN SELECT RAISE(ABORT,'FR metadata must bind its immutable record'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_metadata_immutable BEFORE UPDATE ON frbank_selection_metadata BEGIN SELECT RAISE(ABORT,'Retain immutable FR selection metadata'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_metadata_retained BEFORE DELETE ON frbank_selection_metadata BEGIN SELECT RAISE(ABORT,'Retain historical FR selection metadata'); END;
--> statement-breakpoint
CREATE TABLE frbank_withdrawals (
 record_ref INTEGER PRIMARY KEY REFERENCES frbank_records(record_ref),
 reason TEXT NOT NULL CHECK(length(reason)>0),
 withdrawn_at INTEGER NOT NULL CHECK(withdrawn_at>0)
);
--> statement-breakpoint
CREATE TRIGGER frbank_withdrawal_no_replace BEFORE INSERT ON frbank_withdrawals
 WHEN EXISTS(SELECT 1 FROM frbank_withdrawals old WHERE old.record_ref=NEW.record_ref)
 BEGIN SELECT RAISE(ABORT,'Retain FR withdrawal history'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_withdrawal_immutable BEFORE UPDATE ON frbank_withdrawals BEGIN SELECT RAISE(ABORT,'Retain FR withdrawal history'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_withdrawal_retained BEFORE DELETE ON frbank_withdrawals BEGIN SELECT RAISE(ABORT,'Retain FR withdrawal history'); END;

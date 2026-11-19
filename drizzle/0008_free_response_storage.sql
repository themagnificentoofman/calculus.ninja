-- Additive private storage only. No activation pointer, pool or public route.
CREATE TABLE frbank_records (
 record_ref INTEGER PRIMARY KEY,
 problem_id TEXT NOT NULL, revision INTEGER NOT NULL CHECK(revision>0),
 contract_id TEXT NOT NULL,
 content_hash BLOB NOT NULL CHECK(length(content_hash)=32),
 contract_hash BLOB NOT NULL CHECK(length(contract_hash)=32),
 record_hash BLOB NOT NULL UNIQUE CHECK(length(record_hash)=32),
 topic TEXT NOT NULL CHECK(topic IN ('integration','differentiation','limits','series','differential equations','multivariable')),
 difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard','olympiad')),
 family_id TEXT NOT NULL, construction_id TEXT NOT NULL, lineage_id TEXT NOT NULL,
 mc_problem_ref INTEGER REFERENCES cbank_problems(problem_ref),
 payload_gzip BLOB NOT NULL CHECK(length(payload_gzip)>0 AND length(payload_gzip)<=65536),
 UNIQUE(problem_id,revision,contract_id)
);
--> statement-breakpoint
CREATE INDEX frbank_task_identity ON frbank_records(problem_id,revision,content_hash);
--> statement-breakpoint
CREATE INDEX frbank_lineage ON frbank_records(lineage_id);
--> statement-breakpoint
CREATE INDEX frbank_origin ON frbank_records(mc_problem_ref);
--> statement-breakpoint
CREATE TABLE frbank_admission_receipts (
 record_ref INTEGER NOT NULL REFERENCES frbank_records(record_ref),
 review_hash BLOB NOT NULL CHECK(length(review_hash)=32),
 checker_source_hash BLOB NOT NULL CHECK(length(checker_source_hash)=32),
 PRIMARY KEY(record_ref,review_hash,checker_source_hash)
) WITHOUT ROWID;
--> statement-breakpoint
CREATE TRIGGER frbank_task_consistent BEFORE INSERT ON frbank_records
 WHEN EXISTS(SELECT 1 FROM frbank_records old WHERE old.problem_id=NEW.problem_id AND old.revision=NEW.revision AND old.content_hash<>NEW.content_hash)
 BEGIN SELECT RAISE(ABORT,'Create a new FR task revision'); END;
--> statement-breakpoint
-- REPLACE may omit DELETE triggers when recursive_triggers is disabled.
-- Guard every uniqueness collision before SQLite can perform the replacement.
CREATE TRIGGER frbank_record_no_replace BEFORE INSERT ON frbank_records
 WHEN EXISTS(SELECT 1 FROM frbank_records old WHERE old.record_ref=NEW.record_ref OR old.record_hash=NEW.record_hash OR (old.problem_id=NEW.problem_id AND old.revision=NEW.revision AND old.contract_id=NEW.contract_id))
 BEGIN SELECT RAISE(ABORT,'Retain immutable FR record; no replacement'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_receipt_no_replace BEFORE INSERT ON frbank_admission_receipts
 WHEN EXISTS(SELECT 1 FROM frbank_admission_receipts old WHERE old.record_ref=NEW.record_ref AND old.review_hash=NEW.review_hash AND old.checker_source_hash=NEW.checker_source_hash)
 BEGIN SELECT RAISE(ABORT,'Retain FR admission receipt; no replacement'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_record_immutable BEFORE UPDATE ON frbank_records BEGIN SELECT RAISE(ABORT,'Retain immutable FR task and grading contract'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_record_retained BEFORE DELETE ON frbank_records BEGIN SELECT RAISE(ABORT,'Retain historical FR records'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_receipt_immutable BEFORE UPDATE ON frbank_admission_receipts BEGIN SELECT RAISE(ABORT,'Add a new reviewed admission receipt'); END;
--> statement-breakpoint
CREATE TRIGGER frbank_receipt_retained BEFORE DELETE ON frbank_admission_receipts BEGIN SELECT RAISE(ABORT,'Retain FR admission history'); END;

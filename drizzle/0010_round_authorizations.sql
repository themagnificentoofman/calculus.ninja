-- Additive, disabled until a reviewed policy/control row is explicitly installed.
-- Deploy only with the creation gate disabled and the epoch writer integrated.
-- Historical content, attempts, games and replays are not modified.
CREATE TABLE round_authorization_control (
 id INTEGER PRIMARY KEY CHECK(id=1),
 incarnation BLOB NOT NULL CHECK(length(incarnation)=32),
 epoch INTEGER NOT NULL CHECK(epoch BETWEEN 1 AND 9007199254740991),
 policy_hash BLOB NOT NULL CHECK(length(policy_hash)=32),
 control_version INTEGER NOT NULL CHECK(control_version BETWEEN 1 AND 9007199254740991),
 enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 writing INTEGER NOT NULL DEFAULT 0 CHECK(writing IN (0,1)),
 writer_id BLOB CHECK(writer_id IS NULL OR length(writer_id)=32),
 gc_active INTEGER NOT NULL DEFAULT 0 CHECK(gc_active IN (0,1)),
 retired_before INTEGER NOT NULL DEFAULT 0 CHECK(retired_before BETWEEN 0 AND 8640000000000000),
 ticket_count INTEGER NOT NULL DEFAULT 0 CHECK(ticket_count BETWEEN 0 AND 10000),
 CHECK((writing=0 AND writer_id IS NULL) OR (writing=1 AND writer_id IS NOT NULL)),
 CHECK(writing+gc_active<=1)
) STRICT;
--> statement-breakpoint
CREATE TRIGGER round_control_no_replace BEFORE INSERT ON round_authorization_control
 WHEN EXISTS(SELECT 1 FROM round_authorization_control WHERE id=NEW.id)
 BEGIN SELECT RAISE(ABORT,'Retain authorization control'); END;
--> statement-breakpoint
CREATE TRIGGER round_control_retained BEFORE DELETE ON round_authorization_control
 BEGIN SELECT RAISE(ABORT,'Retain authorization control'); END;
--> statement-breakpoint
CREATE TRIGGER round_control_forward BEFORE UPDATE ON round_authorization_control
 WHEN NEW.epoch<OLD.epoch OR NEW.control_version<OLD.control_version OR NEW.retired_before<OLD.retired_before
 OR ((NEW.incarnation!=OLD.incarnation OR NEW.policy_hash!=OLD.policy_hash OR NEW.enabled!=OLD.enabled)
     AND (NEW.epoch<=OLD.epoch OR NEW.control_version<=OLD.control_version))
 OR (NEW.incarnation!=OLD.incarnation AND NEW.enabled!=0)
 BEGIN SELECT RAISE(ABORT,'Authorization control must advance'); END;
--> statement-breakpoint
CREATE TABLE round_authorization_assert (ok INTEGER NOT NULL CHECK(ok=1)) STRICT;
--> statement-breakpoint
CREATE TABLE round_catalog_mutations (
 mutation_id BLOB PRIMARY KEY CHECK(length(mutation_id)=32),
 mutation_hash BLOB NOT NULL CHECK(length(mutation_hash)=32),
 incarnation BLOB NOT NULL CHECK(length(incarnation)=32),
 before_epoch INTEGER NOT NULL CHECK(before_epoch BETWEEN 1 AND 9007199254740990),
 after_epoch INTEGER NOT NULL CHECK(after_epoch=before_epoch+1)
) WITHOUT ROWID, STRICT;
--> statement-breakpoint
CREATE TRIGGER round_mutation_no_replace BEFORE INSERT ON round_catalog_mutations
 WHEN EXISTS(SELECT 1 FROM round_catalog_mutations WHERE mutation_id=NEW.mutation_id)
 BEGIN SELECT RAISE(ABORT,'Retain catalog mutation receipt'); END;
--> statement-breakpoint
CREATE TRIGGER round_mutation_immutable BEFORE UPDATE ON round_catalog_mutations
 BEGIN SELECT RAISE(ABORT,'Retain catalog mutation receipt'); END;
--> statement-breakpoint
CREATE TRIGGER round_mutation_retained BEFORE DELETE ON round_catalog_mutations
 BEGIN SELECT RAISE(ABORT,'Retain catalog mutation receipt'); END;
--> statement-breakpoint
CREATE TABLE round_authorizations (
 intent_id BLOB PRIMARY KEY CHECK(length(intent_id)=32),
 binding BLOB NOT NULL CHECK(length(binding)=32),
 request_hash BLOB NOT NULL CHECK(length(request_hash)=32),
 selection_hash BLOB NOT NULL CHECK(length(selection_hash)=32),
 policy_hash BLOB NOT NULL CHECK(length(policy_hash)=32),
 control_version INTEGER NOT NULL CHECK(control_version BETWEEN 1 AND 9007199254740991),
 intent_expires INTEGER NOT NULL CHECK(intent_expires BETWEEN 0 AND 8640000000000000),
 history_token BLOB NOT NULL CHECK(length(history_token)=32),
 incarnation BLOB NOT NULL CHECK(length(incarnation)=32),
 epoch INTEGER NOT NULL CHECK(epoch BETWEEN 1 AND 9007199254740991),
 authorization_deadline INTEGER NOT NULL CHECK(authorization_deadline BETWEEN 0 AND 8640000000000000),
 protocol_version INTEGER NOT NULL CHECK(protocol_version=1),
 body_hash BLOB NOT NULL CHECK(length(body_hash)=32),
 authorized_at INTEGER NOT NULL CHECK(authorized_at BETWEEN 0 AND 8640000000000000),
 CHECK(authorized_at<authorization_deadline AND authorization_deadline<=intent_expires),
 CHECK(authorization_deadline-authorized_at<=30000)
) WITHOUT ROWID, STRICT;
--> statement-breakpoint
CREATE INDEX round_authorization_expiry ON round_authorizations(intent_expires,intent_id);
--> statement-breakpoint
CREATE TRIGGER round_authorization_no_replace BEFORE INSERT ON round_authorizations
 WHEN EXISTS(SELECT 1 FROM round_authorizations WHERE intent_id=NEW.intent_id)
 BEGIN SELECT RAISE(ABORT,'Retain exact authorization'); END;
--> statement-breakpoint
CREATE TRIGGER round_authorization_bound BEFORE INSERT ON round_authorizations
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control c WHERE c.id=1 AND c.enabled=1 AND c.writing=0 AND c.gc_active=0
 AND c.incarnation=NEW.incarnation AND c.epoch=NEW.epoch AND c.policy_hash=NEW.policy_hash AND c.control_version=NEW.control_version
 AND c.ticket_count<10000 AND NEW.intent_expires>c.retired_before)
 BEGIN SELECT RAISE(ABORT,'Authorization control mismatch'); END;
--> statement-breakpoint
CREATE TRIGGER round_authorization_immutable BEFORE UPDATE ON round_authorizations
 BEGIN SELECT RAISE(ABORT,'Retain exact authorization'); END;
--> statement-breakpoint
CREATE TRIGGER round_authorization_collectible BEFORE DELETE ON round_authorizations
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND gc_active=1 AND writing=0 AND OLD.intent_expires<=retired_before)
 BEGIN SELECT RAISE(ABORT,'Only retired authorizations may be collected'); END;
--> statement-breakpoint
CREATE TRIGGER round_authorization_added AFTER INSERT ON round_authorizations
 BEGIN UPDATE round_authorization_control SET ticket_count=ticket_count+1 WHERE id=1; END;
--> statement-breakpoint
CREATE TRIGGER round_authorization_removed AFTER DELETE ON round_authorizations
 BEGIN UPDATE round_authorization_control SET ticket_count=ticket_count-1 WHERE id=1; END;
--> statement-breakpoint
-- All currently serving eligibility tables, including staged alias changes.
CREATE TRIGGER round_epoch_cbank_shared_insert BEFORE INSERT ON cbank_shared
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_shared_update BEFORE UPDATE ON cbank_shared
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_shared_delete BEFORE DELETE ON cbank_shared
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problems_insert BEFORE INSERT ON cbank_problems
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problems_update BEFORE UPDATE ON cbank_problems
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problems_delete BEFORE DELETE ON cbank_problems
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_publication_insert BEFORE INSERT ON cbank_publication
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_publication_update BEFORE UPDATE ON cbank_publication
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_publication_delete BEFORE DELETE ON cbank_publication
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_releases_insert BEFORE INSERT ON cbank_releases
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_releases_update BEFORE UPDATE ON cbank_releases
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_releases_delete BEFORE DELETE ON cbank_releases
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_pools_insert BEFORE INSERT ON cbank_pools
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_pools_update BEFORE UPDATE ON cbank_pools
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_pools_delete BEFORE DELETE ON cbank_pools
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_slots_insert BEFORE INSERT ON cbank_slots
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_slots_update BEFORE UPDATE ON cbank_slots
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_slots_delete BEFORE DELETE ON cbank_slots
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_config_insert BEFORE INSERT ON cbank_config
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_config_update BEFORE UPDATE ON cbank_config
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_config_delete BEFORE DELETE ON cbank_config
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_sources_insert BEFORE INSERT ON cbank_release_sources
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_sources_update BEFORE UPDATE ON cbank_release_sources
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_sources_delete BEFORE DELETE ON cbank_release_sources
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_selection_features_insert BEFORE INSERT ON cbank_selection_features
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_selection_features_update BEFORE UPDATE ON cbank_selection_features
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_selection_features_delete BEFORE DELETE ON cbank_selection_features
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_family_lineage_insert BEFORE INSERT ON cbank_family_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_family_lineage_update BEFORE UPDATE ON cbank_family_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_family_lineage_delete BEFORE DELETE ON cbank_family_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problem_lineage_insert BEFORE INSERT ON cbank_problem_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problem_lineage_update BEFORE UPDATE ON cbank_problem_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_problem_lineage_delete BEFORE DELETE ON cbank_problem_lineage
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_exclusions_insert BEFORE INSERT ON cbank_release_exclusions
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_exclusions_update BEFORE UPDATE ON cbank_release_exclusions
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_release_exclusions_delete BEFORE DELETE ON cbank_release_exclusions
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_withdrawn_families_insert BEFORE INSERT ON cbank_withdrawn_families
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_withdrawn_families_update BEFORE UPDATE ON cbank_withdrawn_families
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_cbank_withdrawn_families_delete BEFORE DELETE ON cbank_withdrawn_families
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_records_insert BEFORE INSERT ON frbank_records
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_records_update BEFORE UPDATE ON frbank_records
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_records_delete BEFORE DELETE ON frbank_records
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_admission_receipts_insert BEFORE INSERT ON frbank_admission_receipts
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_admission_receipts_update BEFORE UPDATE ON frbank_admission_receipts
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_admission_receipts_delete BEFORE DELETE ON frbank_admission_receipts
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_selection_metadata_insert BEFORE INSERT ON frbank_selection_metadata
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_selection_metadata_update BEFORE UPDATE ON frbank_selection_metadata
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_selection_metadata_delete BEFORE DELETE ON frbank_selection_metadata
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_withdrawals_insert BEFORE INSERT ON frbank_withdrawals
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_withdrawals_update BEFORE UPDATE ON frbank_withdrawals
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;
--> statement-breakpoint
CREATE TRIGGER round_epoch_frbank_withdrawals_delete BEFORE DELETE ON frbank_withdrawals
 WHEN NOT EXISTS(SELECT 1 FROM round_authorization_control WHERE id=1 AND writing=1 AND writer_id IS NOT NULL AND gc_active=0)
 BEGIN SELECT RAISE(ABORT,'Catalog writer envelope required'); END;

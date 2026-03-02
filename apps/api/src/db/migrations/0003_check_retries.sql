ALTER TABLE "check_results" ADD COLUMN IF NOT EXISTS "retry_count" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "check_results" ADD COLUMN IF NOT EXISTS "max_retries" integer DEFAULT 3 NOT NULL;

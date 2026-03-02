CREATE TABLE "check_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"check_id" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"risk_level" text,
	"summary" text,
	"details" jsonb,
	"sources" jsonb,
	"guidance" jsonb,
	"insight" jsonb,
	"tier" integer NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"check_result_id" uuid,
	"recipient_name" text,
	"recipient_email" text,
	"recipient_org" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"reference_id" text NOT NULL,
	"status" text DEFAULT 'drafted' NOT NULL,
	"response_summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_url" text,
	"address" text NOT NULL,
	"municipality" text,
	"province" text DEFAULT 'BC' NOT NULL,
	"property_type" text,
	"year_built" integer,
	"lot_size" text,
	"price" integer,
	"pid" text,
	"water_source" text,
	"sewer_type" text,
	"is_strata" boolean DEFAULT false,
	"buyer_type" text NOT NULL,
	"buyer_goal" text,
	"is_first_time_buyer" boolean DEFAULT false,
	"listing_data" jsonb,
	"zoning_data" jsonb,
	"ocp_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"check_result_id" uuid,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_path" text NOT NULL,
	"ai_analysis" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_results" ADD CONSTRAINT "check_results_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_check_result_id_check_results_id_fk" FOREIGN KEY ("check_result_id") REFERENCES "public"."check_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_documents" ADD CONSTRAINT "uploaded_documents_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_documents" ADD CONSTRAINT "uploaded_documents_check_result_id_check_results_id_fk" FOREIGN KEY ("check_result_id") REFERENCES "public"."check_results"("id") ON DELETE no action ON UPDATE no action;
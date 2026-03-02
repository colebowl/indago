CREATE TABLE "report_section_answers" (
	"property_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"ai_answer" text NOT NULL,
	"synthesized_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_section_answers_property_id_question_id_pk" PRIMARY KEY("property_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "report_section_answers" ADD CONSTRAINT "report_section_answers_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingUrl: text('listing_url'),
  address: text('address').notNull(),
  municipality: text('municipality'),
  province: text('province').notNull().default('BC'),
  propertyType: text('property_type'),
  yearBuilt: integer('year_built'),
  lotSize: text('lot_size'),
  price: integer('price'),
  pid: text('pid'),
  waterSource: text('water_source'),
  sewerType: text('sewer_type'),
  isStrata: boolean('is_strata').default(false),
  buyerType: text('buyer_type').notNull(),
  buyerGoal: text('buyer_goal'),
  isFirstTimeBuyer: boolean('is_first_time_buyer').default(false),
  listingData: jsonb('listing_data'),
  zoningData: jsonb('zoning_data'),
  ocpData: jsonb('ocp_data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const checkResults = pgTable('check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  checkId: text('check_id').notNull(),
  status: text('status').notNull().default('not_started'),
  riskLevel: text('risk_level'),
  summary: text('summary'),
  details: jsonb('details'),
  sources: jsonb('sources'),
  guidance: jsonb('guidance'),
  insight: jsonb('insight'),
  tier: integer('tier').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  checkResultId: uuid('check_result_id').references(() => checkResults.id),
  recipientName: text('recipient_name'),
  recipientEmail: text('recipient_email'),
  recipientOrg: text('recipient_org'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  referenceId: text('reference_id').notNull(),
  status: text('status').notNull().default('drafted'),
  responseSummary: text('response_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const uploadedDocuments = pgTable('uploaded_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  checkResultId: uuid('check_result_id').references(() => checkResults.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  filePath: text('file_path').notNull(),
  aiAnalysis: jsonb('ai_analysis'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

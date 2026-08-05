import { pgTable, serial, text, timestamp, boolean, uuid, pgEnum, integer } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "enterprise", "admin"]);
export const taskStatusEnum = pgEnum("task_status", ["open", "in_progress", "completed", "cancelled"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "in_progress", "completed", "approved"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Maps to auth.users
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  bio: text("bio"),
  resumeUrl: text("resume_url"),
  avatarUrl: text("avatar_url"),
  skills: text("skills").array(), // Array of skills
  education: text("education"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enterpriseProfiles = pgTable("enterprise_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  companyName: text("company_name").notNull(),
  description: text("description"),
  website: text("website"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  enterpriseId: uuid("enterprise_id").references(() => enterpriseProfiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(),
  status: taskStatusEnum("status").default("open").notNull(),
  category: text("category").notNull(),
  requiredSkills: text("required_skills").array(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => studentProfiles.id, { onDelete: "cascade" }).notNull(),
  coverLetter: text("cover_letter").notNull(),
  status: applicationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }).notNull(),
  pdfUrl: text("pdf_url"),
  signedByEnterprise: boolean("signed_by_enterprise").default(false),
  signedByStudent: boolean("signed_by_student").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  status: milestoneStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  receiverId: uuid("receiver_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  revieweeId: uuid("reviewee_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

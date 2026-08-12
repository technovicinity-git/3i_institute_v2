import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "argon2";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});

const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────
// All permission keys (matching SRD)
// ──────────────────────────────────────
const PERMISSIONS: { key: string; description: string }[] = [
  // Auth
  { key: "auth.register", description: "Register new accounts" },
  { key: "auth.verify_email", description: "Verify email address" },

  // Users
  { key: "users.read", description: "View users" },
  { key: "users.create", description: "Create users manually" },
  { key: "users.update", description: "Edit user profiles" },
  { key: "users.delete", description: "Delete users" },
  { key: "users.suspend", description: "Suspend or activate users" },

  // Learner profiles
  { key: "profiles.create", description: "Create learner profiles" },
  { key: "profiles.update", description: "Update learner profiles" },
  { key: "profiles.delete", description: "Delete learner profiles" },

  // Instructors
  { key: "instructors.approve", description: "Approve or reject instructors" },
  {
    key: "instructors.manage",
    description: "Manage instructor records and WWCC",
  },
  { key: "instructors.suspend", description: "Suspend instructors" },

  // Courses
  { key: "courses.create", description: "Create courses" },
  { key: "courses.read", description: "View courses" },
  { key: "courses.update", description: "Edit courses" },
  { key: "courses.delete", description: "Delete courses" },
  { key: "courses.publish", description: "Publish courses" },
  { key: "courses.approve", description: "Approve under-13 courses" },
  { key: "courses.suspend", description: "Suspend courses" },

  // Materials
  { key: "materials.upload", description: "Upload course materials" },
  { key: "materials.delete", description: "Delete course materials" },

  // Batches
  { key: "batches.create", description: "Create batches" },
  { key: "batches.update", description: "Edit batches" },
  { key: "batches.delete", description: "Delete batches" },
  { key: "batches.manage", description: "Close and reopen batches" },

  // Enrolment
  { key: "enrolment.enrol", description: "Enrol in courses" },
  { key: "enrolment.manage", description: "Manage enrolments" },

  // Attendance
  { key: "attendance.mark", description: "Mark attendance" },

  // Questions
  { key: "questions.create", description: "Create questions" },
  { key: "questions.read_own", description: "Read own questions" },
  { key: "questions.read_all", description: "Read all questions" },
  { key: "questions.update", description: "Update questions" },
  { key: "questions.delete", description: "Delete questions" },

  // Exams
  { key: "exams.create", description: "Create exams" },
  { key: "exams.read", description: "View exams" },
  { key: "exams.grade", description: "Grade exam answers" },
  { key: "exams.attempt", description: "Attempt exams" },

  // Certificates
  { key: "certificates.read", description: "View certificates" },
  { key: "certificates.revoke", description: "Revoke certificates" },

  // Subscriptions
  { key: "billing.manage", description: "Manage billing" },
  { key: "billing.read", description: "View billing details" },

  // Waivers
  { key: "waivers.request", description: "Request waivers" },
  { key: "waivers.manage", description: "Approve or reject waivers" },

  // Chat
  { key: "chat.send", description: "Send chat messages" },
  { key: "chat.read", description: "Read chat messages" },
  { key: "chat.moderate", description: "Moderate chat" },
  { key: "chat.audit", description: "Audit chat logs" },

  // Notifications
  { key: "notifications.send", description: "Send notifications" },
  { key: "notifications.read", description: "Read notifications" },

  // CMS
  { key: "cms.manage", description: "Manage website content" },

  // Reports
  { key: "reports.read", description: "View reports" },
  { key: "reports.export", description: "Export reports" },

  // Admin
  { key: "admin.access", description: "Access admin panel" },
  { key: "admin.settings", description: "Manage platform settings" },

  // Ratings
  { key: "ratings.create", description: "Rate courses" },
  { key: "ratings.moderate", description: "Moderate ratings" },
];

// ──────────────────────────────────────
// Seeded roles with their permissions
// ──────────────────────────────────────
const ROLES: { name: string; permissions: string[] }[] = [
  {
    name: "Admin",
    permissions: PERMISSIONS.map((p) => p.key), // All permissions
  },
  {
    name: "Instructor",
    permissions: [
      "auth.verify_email",
      "users.read",
      "courses.create",
      "courses.read",
      "courses.update",
      "courses.delete",
      "courses.publish",
      "materials.upload",
      "materials.delete",
      "batches.create",
      "batches.update",
      "batches.delete",
      "batches.manage",
      "enrolment.manage",
      "attendance.mark",
      "questions.create",
      "questions.read_own",
      "questions.update",
      "questions.delete",
      "exams.create",
      "exams.read",
      "exams.grade",
      "certificates.read",
      "chat.send",
      "chat.read",
      "chat.moderate",
      "notifications.send",
      "notifications.read",
      "ratings.create",
    ],
  },
  {
    name: "Account Holder",
    permissions: [
      "auth.verify_email",
      "users.read",
      "users.update",
      "profiles.create",
      "profiles.update",
      "profiles.delete",
      "courses.read",
      "enrolment.enrol",
      "exams.read",
      "exams.attempt",
      "certificates.read",
      "billing.read",
      "waivers.request",
      "chat.send",
      "chat.read",
      "notifications.read",
      "ratings.create",
    ],
  },
];

async function main(): Promise<void> {
  console.log("🌱 Seeding database...");

  // ──────────────────────────────────────
  // Create permissions
  // ──────────────────────────────────────
  const permissionMap: Map<string, string> = new Map();

  for (const perm of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: { key: perm.key, description: perm.description },
    });
    permissionMap.set(created.key, created.id);
  }

  console.log(`✅ ${PERMISSIONS.length} permissions seeded`);

  // ──────────────────────────────────────
  // Create roles and assign permissions
  // ──────────────────────────────────────
  for (const roleData of ROLES) {
    const permissionIds = roleData.permissions
      .map((key) => permissionMap.get(key))
      .filter((id): id is string => id !== undefined);

    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        permissions: {
          create: permissionIds.map((permId) => ({
            permissionId: permId,
          })),
        },
      },
    });
  }

  console.log(`✅ ${ROLES.length} roles seeded`);

  // ──────────────────────────────────────
  // Create default admin user
  // ──────────────────────────────────────
  const adminRole = await prisma.role.findUnique({
    where: { name: "Admin" },
  });

  if (!adminRole) {
    throw new Error("Admin role not found — seeding failed");
  }

  const adminPasswordHash = await hash("Admin@1234567890");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@3iinstitute.edu" },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        firstName: "Platform",
        lastName: "Admin",
        email: "admin@3iinstitute.edu",
        passwordHash: adminPasswordHash,
        dateOfBirth: new Date("1990-01-01"),
        locale: "en",
        accountType: "ADULT",
        emailVerified: true,
        roleId: adminRole.id,
      },
    });
    console.log("✅ Default admin user created");
    console.log("   Email: admin@3iinstitute.edu");
    console.log("   Password: Admin@1234567890");
  } else {
    console.log("ℹ️  Admin user already exists — skipped");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
  Seed admin and reviewer users.
  Usage:
    # All users (admin + reviewer)
    ADMIN_EMAIL=... ADMIN_PASSWORD=... REVIEWER_EMAIL=... REVIEWER_PASSWORD=... node prisma/seed-users.js

    # Only admin
    ADMIN_EMAIL=... ADMIN_PASSWORD=... node prisma/seed-users.js admin

    # Only reviewer
    REVIEWER_EMAIL=... REVIEWER_PASSWORD=... node prisma/seed-users.js reviewer
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertUser({ email, password, name, role }) {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, name, role },
    create: { email, password: hash, name, role },
  });
  return user;
}

async function ensureReviewerLease(userId) {
  // If reviewer has no lease, create a default active lease for demo/review purposes
  const existing = await prisma.lease.findFirst({ where: { tenantId: userId } });
  if (existing) return existing;
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 12);
  return prisma.lease.create({
    data: {
      startDate: start,
      endDate: end,
      rentAmount: 1200,
      status: 'ACTIVE',
      tenantId: userId,
    },
  });
}

async function main() {
  const mode = (process.argv[2] || 'both').toLowerCase();

  let adminCreds = {
    email: process.env.ADMIN_EMAIL || 'admin@ultimateapartmentmanager.com',
    password: process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(2) + '!Adm1n',
    name: 'Administrator',
  };
  let reviewerCreds = {
    email: process.env.REVIEWER_EMAIL || 'reviewer@ultimateapartmentmanager.com',
    password: process.env.REVIEWER_PASSWORD || Math.random().toString(36).slice(2) + '!Rev1ew',
    name: 'Reviewer',
  };

  const out = { created: [], updated: [] };

  if (mode === 'admin' || mode === 'both') {
    const user = await upsertUser({
      email: adminCreds.email,
      password: adminCreds.password,
      name: adminCreds.name,
      role: 'ADMIN',
    });
    out.created.push({ role: 'ADMIN', email: user.email, password: adminCreds.password });
  }

  if (mode === 'reviewer' || mode === 'both') {
    const user = await upsertUser({
      email: reviewerCreds.email,
      password: reviewerCreds.password,
      name: reviewerCreds.name,
      role: 'TENANT',
    });
    await ensureReviewerLease(user.id);
    out.created.push({ role: 'TENANT (Reviewer)', email: user.email, password: reviewerCreds.password });
  }

  console.log('\nSeed complete. Credentials to use:');
  out.created.forEach((u) => {
    console.log(` - ${u.role}: ${u.email} / ${u.password}`);
  });
  console.log('\nIMPORTANT: Change these passwords after initial use.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ARKITECH", 10);

  await prisma.user.deleteMany({
    where: { email: { in: ["ashish@locallead.test", "terri@locallead.test"] } },
  });

  const ashish = await prisma.user.upsert({
    where: { email: "ashish@arkitech.com" },
    update: {
      name: "Ashish",
      passwordHash,
      role: "OWNER",
    },
    create: {
      name: "Ashish",
      email: "ashish@arkitech.com",
      passwordHash,
      role: "OWNER",
    },
  });

  const terri = await prisma.user.upsert({
    where: { email: "terri@arkitech.com" },
    update: {
      name: "Terri",
      passwordHash,
      role: "MEMBER",
    },
    create: {
      name: "Terri",
      email: "terri@arkitech.com",
      passwordHash,
      role: "MEMBER",
    },
  });

  const maple = await prisma.lead.upsert({
    where: { googlePlaceId: "seed-maple-dental" },
    update: {},
    create: {
      businessName: "Maple Street Dental",
      category: "Dentist",
      phone: "(919) 555-0134",
      email: "hello@maplestreetdental.test",
      website: "https://example.com",
      address: "214 Maple St",
      city: "Raleigh",
      state: "NC",
      googlePlaceId: "seed-maple-dental",
      googleMapsUrl: "https://maps.google.com",
      googleRating: 4.7,
      googleReviewCount: 38,
      status: "FOLLOW_UP",
      websiteScore: 62,
      pageSpeedPerformance: 58,
      pageSpeedAccessibility: 83,
      pageSpeedSEO: 71,
      pageSpeedBestPractices: 76,
      notes: "Owner asked for examples of booking flow improvements.",
      assignedToId: ashish.id,
    },
  });

  await prisma.lead.upsert({
    where: { googlePlaceId: "seed-bright-oak" },
    update: {},
    create: {
      businessName: "Bright Oak Roofing",
      category: "Roofing Contractor",
      phone: "(919) 555-0188",
      website: null,
      address: "88 Oak Ridge Rd",
      city: "Durham",
      state: "NC",
      googlePlaceId: "seed-bright-oak",
      googleMapsUrl: "https://maps.google.com",
      googleRating: 4.9,
      googleReviewCount: 19,
      status: "NEW",
      notes: "No public website listed. Strong fit for starter website offer.",
      assignedToId: terri.id,
    },
  });

  await prisma.lead.upsert({
    where: { googlePlaceId: "seed-pine-salon" },
    update: {},
    create: {
      businessName: "Pine & Co. Salon",
      category: "Hair Salon",
      phone: "(984) 555-0105",
      email: "frontdesk@pineco.test",
      website: "https://example.org",
      address: "450 Franklin Ave",
      city: "Chapel Hill",
      state: "NC",
      googlePlaceId: "seed-pine-salon",
      googleMapsUrl: "https://maps.google.com",
      googleRating: 4.5,
      googleReviewCount: 73,
      status: "MEETING_BOOKED",
      websiteScore: 74,
      pageSpeedPerformance: 68,
      pageSpeedAccessibility: 91,
      pageSpeedSEO: 80,
      pageSpeedBestPractices: 88,
      notes: "Booked discovery call for Thursday.",
      assignedToId: ashish.id,
    },
  });

  await prisma.callNote.create({
    data: {
      leadId: maple.id,
      userId: ashish.id,
      note: "Left voicemail with a concise website audit hook.",
      callOutcome: "LEFT_VOICEMAIL",
      followUpDate: new Date(Date.now() + 86400000),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

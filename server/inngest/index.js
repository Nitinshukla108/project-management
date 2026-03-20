import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

// Sync User Creation - Using UPSERT to handle race conditions
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    const email = data?.email_addresses[0]?.email_address;
    const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();

    await prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: email,
        name: name,
        image: data?.image_url,
      },
      create: {
        id: data.id,
        email: email,
        name: name,
        image: data?.image_url,
      },
    });
  }
);

// Sync User Deletion - Using deleteMany to avoid "record not found" errors
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.deleteMany({
      where: { id: data.id },
    });
  }
);

// Sync User Updation - Using UPSERT as a safety net
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    const email = data?.email_addresses[0]?.email_address;
    const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();

    await prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: email,
        name: name,
        image: data?.image_url,
      },
      create: {
        id: data.id,
        email: email,
        name: name,
        image: data?.image_url,
      },
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation
];
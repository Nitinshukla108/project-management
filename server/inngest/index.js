import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

// 1. CREATE/UPDATE (Combined Logic)
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    const email = data?.email_addresses?.[0]?.email_address;
    const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim() || "Unknown User";

    // UPSERT is the key. It checks if ID exists. 
    // If yes -> Update. If no -> Create.
    return await prisma.user.upsert({
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

// 2. DELETE (Safe Logic)
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    // deleteMany does NOT throw an error if the user is already gone.
    // .delete() WILL throw an error and make the Inngest run fail.
    return await prisma.user.deleteMany({
      where: { id: data.id },
    });
  }
);

// 3. UPDATE (Safety Net)
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    const email = data?.email_addresses?.[0]?.email_address;
    const name = `${data?.first_name || ""} ${data?.last_name || ""}`.trim();

    return await prisma.user.upsert({
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
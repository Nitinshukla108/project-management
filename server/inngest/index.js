// import { Inngest } from "inngest";
// import prisma from "../configs/prisma.js";

// export const inngest = new Inngest({ id: "project-management" });

// // ✅ CREATE USER
// const syncUserCreation = inngest.createFunction(
//   { id: "sync-user-from-clerk" },
//   { event: "clerk/user.created" },
//   async ({ event }) => {
//     console.log("EVENT RECEIVED:", event);

//     const { data } = event;

//     await prisma.user.create({
//       data: {
//         id: data.id,
//         email: data.email_addresses[0]?.email_address,
//         name: data?.first_name + " " + data?.last_name,
//         image: data?.image_url,
//       },
//     });
//   }
// );

// // ✅ DELETE USER
// const syncUserDeletion = inngest.createFunction(
//   { id: "delete-user-from-clerk" },
//   { event: "clerk/user.deleted" },
//   async ({ event }) => {
//     const { data } = event;

//     await prisma.user.delete({
//       where: { id: data.id },
//     });
//   }
// );

// // ✅ UPDATE USER
// const syncUserUpdation = inngest.createFunction(
//   { id: "update-user-from-clerk" },
//   { event: "clerk/user.updated" },
//   async ({ event }) => {
//     const { data } = event;

//     await prisma.user.update({
//       where: { id: data.id },
//       data: {
//         email: data.email_addresses[0]?.email_address, // ✅ FIXED
//         name: data?.first_name + " " + data?.last_name,
//         image: data?.image_url,
//       },
//     });
//   }
// );

// export const functions = [
//   syncUserCreation,
//   syncUserDeletion,
//   syncUserUpdation,
// ];


import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });




//  CREATE USER (FIXED)
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("EVENT RECEIVED:", event);

    const { data } = event;

    //  Safe email extraction
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    await prisma.user.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        email: primaryEmail || "no-email",
        name: (data?.first_name || "") + " " + (data?.last_name || ""),
        image: data?.image_url || "",
      },
    });
  }
);


//  DELETE USER
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });
  }
);


//  UPDATE USER (FIXED)
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    // Safe email extraction
    const primaryEmail = data.email_addresses?.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: primaryEmail || "no-email",
        name: (data?.first_name || "") + " " + (data?.last_name || ""),
        image: data?.image_url || "",
      },
    });
  }
);


//  EXPORT FUNCTIONS
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];
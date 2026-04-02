import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { polarClient } from "./polar";
import { polar, checkout, portal } from "@polar-sh/better-auth";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // ✅ ADD THIS BLOCK
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://thoughtful-electrotactic-drema.ngrok-free.dev",
  ],

  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "5c5f0c03-8918-438e-a83c-9eef57870cf4",
              slug: "Nodebase-Pro",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});

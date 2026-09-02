import { checkout, polar, portal } from "@polar-sh/better-auth";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import prisma from "@/lib/db";
import { otpSendAllowed } from "@/lib/otp-limit";
import { enqueueOtpEmail } from "@/lib/queue/email-queue";
import { polarClient } from "./polar";

const OTP_SEND_PATH = "/email-otp/send-verification-otp";

/**
 * Short-circuits the OTP endpoint BEFORE better-auth generates and stores a
 * new code, so a rate-limited request neither burns the email queue nor
 * invalidates the previously sent code.
 */
const otpCooldownPlugin: BetterAuthPlugin = {
  id: "otp-cooldown",
  hooks: {
    before: [
      {
        matcher: (ctx) => ctx.path === OTP_SEND_PATH,
        handler: createAuthMiddleware(async (ctx) => {
          const email =
            typeof ctx.body?.email === "string" ? ctx.body.email : null;

          if (!email) {
            return;
          }

          if (!(await otpSendAllowed(email))) {
            return ctx.json(
              {
                message:
                  "A verification code was recently sent. Please wait before requesting another.",
              },
              { status: 429 },
            );
          }
        }),
      },
    ],
  },
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendOnSignIn: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],

  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
    customRules: {
      [OTP_SEND_PATH]: { window: 60, max: 3 },
      "/email-otp/verify-email": { window: 300, max: 8 },
    },
  },

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
    otpCooldownPlugin,
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      storeOTP: "hashed",
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        await enqueueOtpEmail({ email, otp, type });
      },
    }),
  ],
});

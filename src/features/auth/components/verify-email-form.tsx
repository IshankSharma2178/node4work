"use client";

import { CheckIcon, Loader2, RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

interface VerifyEmailFormProps {
  email?: string | null;
}

const sendEndpoint = "/api/auth/email-otp/send-verification-otp";
const verifyEndpoint = "/api/auth/email-otp/verify-email";

export function VerifyEmailForm({ email: initialEmail }: VerifyEmailFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(() => (initialEmail ? 60 : 0));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtp = async () => {
    if (!email || countdown > 0 || sending) {
      return;
    }

    setSending(true);

    try {
      const res = await fetch(sendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "email-verification" }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.message || "Could not send the code.");
        if (res.status === 429) {
          setCountdown(60);
        }
        return;
      }

      toast.success("Verification code sent");
      setCountdown(60);
    } catch {
      toast.error("Could not send the code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (!email || otp.length !== 6 || verifying) {
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        let message = "Invalid code. Please try again.";
        try {
          const body = await res.json();
          if (body?.code === "TOO_MANY_ATTEMPTS") {
            message = "Too many incorrect attempts. Please request a new code.";
          } else if (body?.code === "OTP_EXPIRED") {
            message = "This code has expired. Please request a new one.";
          } else if (body?.message) {
            message = body.message;
          }
        } catch {
          // keep default message
        }
        toast.error(message);
        setOtp("");
        return;
      }

      toast.success("Email verified!");
      router.push("/workflows");
    } catch {
      toast.error("Could not verify the code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/90 backdrop-blur-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to your inbox. It expires in 5 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {initialEmail ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2.5 text-sm">
            <CheckIcon className="size-4 shrink-0 text-primary" />
            <span className="truncate">{initialEmail}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="verify-email">Email</Label>
            <Input
              id="verify-email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Label className="self-start">Verification code</Label>
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              onComplete={verify}
              disabled={verifying}
            >
              <InputOTPGroup>
                {["0", "1", "2", "3", "4", "5"].map((slot, index) => (
                  <InputOTPSlot key={slot} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={verify}
            className="w-full h-10"
            disabled={otp.length !== 6 || verifying}
          >
            {verifying && <Loader2 className="size-4 animate-spin" />}
            {verifying ? "Verifying..." : "Verify email"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Didn&apos;t receive the code?
            </span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              disabled={countdown > 0 || sending || !email}
              onClick={sendOtp}
            >
              {sending && <Loader2 className="size-3.5 animate-spin mr-1" />}
              {!sending && <RotateCwIcon className="size-3.5 mr-1" />}
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Changed your mind?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInGithub = async () =>
    await authClient.signIn.social(
      {
        provider: "github",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );

  const signInGoogle = async () =>
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/workflows",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/90 backdrop-blur-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Get started with Nodebase in seconds</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3">
          <Button
            onClick={signInGithub}
            variant="outline"
            className="w-full h-10 gap-2"
            type="button"
            disabled={isPending}
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={18}
              height={18}
              className="dark:invert"
            />
            Continue with GitHub
          </Button>
          <Button
            onClick={signInGoogle}
            variant="outline"
            className="w-full h-10 gap-2"
            type="button"
            disabled={isPending}
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} />
            Continue with Google
          </Button>
        </div>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or sign up with email
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-10" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

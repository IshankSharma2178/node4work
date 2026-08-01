"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { LoaderIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { registerTelegramWebhook } from "./actions";

export const formSchema = z.object({
  credentialId: z.string().min(1, { message: "Credential is required" }),
});

export type TelegramTriggerFormValue = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<TelegramTriggerFormValue>;
}

export const TelegramTriggerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;

  const [registering, setRegistering] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{
    ok: boolean;
    description?: string;
    botUsername?: string;
    duplicateWorkflows?: boolean;
  } | null>(null);

  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.TELEGRAM);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleRegister = async () => {
    setRegistering(true);
    setWebhookStatus(null);
    try {
      const result = await registerTelegramWebhook(workflowId);
      setWebhookStatus(result);
      if (result.ok) {
        toast.success("Telegram webhook registered");
      } else {
        toast.error(result.description || "Failed to register webhook");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to register webhook",
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram Trigger Configuration</DialogTitle>
          <DialogDescription>
            Connects a Telegram bot and starts the workflow whenever a new
            message arrives.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Bot Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/telegram.svg"
                              alt="Telegram"
                              width={16}
                              height={16}
                            />

                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Create a bot token with @BotFather, then save it as a
                    Telegram credential.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleRegister}
                disabled={registering || !form.watch("credentialId")}
              >
                {registering ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Registering webhook...
                  </>
                ) : (
                  "Register Webhook"
                )}
              </Button>

              {webhookStatus && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    webhookStatus.ok
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {webhookStatus.ok
                    ? `Webhook registered${webhookStatus.botUsername ? ` for @${webhookStatus.botUsername}` : ""}.`
                    : webhookStatus.description}
                  {webhookStatus.duplicateWorkflows &&
                    " Warning: this bot is used in another workflow — only the last registered webhook receives updates."}
                </div>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-medium text-sm">Available Variables</h4>

              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{telegram.chat.id}}"}
                  </code>{" "}
                  - Chat ID
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{telegram.text}}"}
                  </code>{" "}
                  - Message text
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{telegram.from.id}}"}
                  </code>{" "}
                  - Sender user ID
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{telegram.from.username}}"}
                  </code>{" "}
                  - Sender username
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{telegram.date}}"}
                  </code>{" "}
                  - Message timestamp
                </li>
                <li>
                  <code className="bg-background px-1 py-0.5 rounded">
                    {"{{json telegram}}"}
                  </code>{" "}
                  - Full update as JSON
                </li>
              </ul>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

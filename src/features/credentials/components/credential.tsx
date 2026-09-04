"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(CredentialType),
  value: z.string().min(1, "API key is required"),
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/gemini.svg",
  },
  {
    value: CredentialType.TELEGRAM,
    label: "Telegram",
    logo: "/telegram.svg",
  },
  {
    value: CredentialType.GOOGLE_SHEETS,
    label: "Google Sheets",
    logo: "/google-sheets.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value: string;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();

  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      type: CredentialType.OPENAI,
      value: "",
    },
  });

  const watchType = form.watch("type");
  const isGoogleSheets = watchType === CredentialType.GOOGLE_SHEETS;

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        ...values,
      });
    } else {
      await createCredential.mutateAsync(values, {
        onSuccess: (data) => {
          router.push(`/credentials/${data.id}`);
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  return (
    <>
      {modal}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>

          <CardDescription>
            {isEdit
              ? "Update your API key or credential details"
              : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My API key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />

                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isGoogleSheets ? "Service Account JSON" : "API Key"}
                    </FormLabel>
                    <FormControl>
                      {isGoogleSheets ? (
                        <Textarea
                          placeholder={`{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n..."\n}`}
                          className="min-h-[160px] font-mono text-xs"
                          rows={8}
                          {...field}
                        />
                      ) : (
                        <Input
                          type="password"
                          placeholder="sk-..."
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isGoogleSheets && (
                <Alert>
                  <Info className="size-4" />
                  <AlertTitle>Setup Guide</AlertTitle>
                  <AlertDescription>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="step-1">
                        <AccordionTrigger className="text-xs">
                          1. Enable Google Sheets API
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground">
                          <ol className="list-decimal space-y-1 pl-4">
                            <li>
                              Open the{" "}
                              <a
                                href="https://console.cloud.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                              >
                                Google Cloud Console
                              </a>
                              .
                            </li>
                            <li>
                              Select an existing project or click{" "}
                              <strong>New Project</strong> to create one.
                            </li>
                            <li>
                              In the top search bar, type{" "}
                              <strong>Google Sheets API</strong> and select it
                              from the results.
                            </li>
                            <li>
                              Click the <strong>Enable</strong> button.
                            </li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="step-2">
                        <AccordionTrigger className="text-xs">
                          2. Create a Service Account
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground">
                          <ol className="list-decimal space-y-1 pl-4">
                            <li>
                              Open the navigation menu and go to{" "}
                              <strong>
                                IAM &amp; Admin &gt; Service Accounts
                              </strong>
                              .
                            </li>
                            <li>
                              Click <strong>Create Service Account</strong> at
                              the top.
                            </li>
                            <li>
                              Enter a name (e.g.{" "}
                              <code className="rounded bg-muted px-1">
                                sheets-integration
                              </code>
                              ) and click <strong>Create and Continue</strong>.
                            </li>
                            <li>
                              Under <strong>Select a role</strong>, choose{" "}
                              <strong>Project &gt; Editor</strong> or{" "}
                              <strong>Viewer</strong>.
                            </li>
                            <li>
                              Click <strong>Continue</strong>, then{" "}
                              <strong>Done</strong>.
                            </li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="step-3">
                        <AccordionTrigger className="text-xs">
                          3. Download the JSON Key
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground">
                          <ol className="list-decimal space-y-1 pl-4">
                            <li>
                              In the Service Accounts list, click on the service
                              account email to open its details.
                            </li>
                            <li>
                              Navigate to the <strong>Keys</strong> tab.
                            </li>
                            <li>
                              Click <strong>Add Key</strong> &gt;{" "}
                              <strong>Create new key</strong>.
                            </li>
                            <li>
                              Choose <strong>JSON</strong> as the key type and
                              click <strong>Create</strong>.
                            </li>
                            <li>
                              A JSON file will be downloaded. Paste its contents
                              into the field above.
                            </li>
                          </ol>
                          <p className="mt-2 text-orange-600 dark:text-orange-400">
                            This JSON file contains your private key. Never
                            commit it to a public repository.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="step-4">
                        <AccordionTrigger className="text-xs">
                          4. Share Your Spreadsheet
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground">
                          <ol className="list-decimal space-y-1 pl-4">
                            <li>Open the Google Sheet you want to connect.</li>
                            <li>
                              Click <strong>Share</strong> in the top-right
                              corner.
                            </li>
                            <li>
                              Paste the <strong>service account email</strong>{" "}
                              (from step 2, listed under the service account
                              name).
                            </li>
                            <li>
                              Set permission to <strong>Editor</strong> (or{" "}
                              <strong>Viewer</strong> for read-only).
                            </li>
                            <li>
                              Uncheck <strong>Notify people</strong> and click{" "}
                              <strong>Share</strong>.
                            </li>
                          </ol>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={
                    createCredential.isPending || updateCredential.isPending
                  }
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};

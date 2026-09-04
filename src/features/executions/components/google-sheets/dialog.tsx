"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";

export const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, { message: "Credential is required" }),
  operation: z.enum(["append", "read", "update"]),
  spreadsheetId: z.string().min(1, { message: "Spreadsheet ID is required" }),
  range: z.string().min(1, { message: "Range is required" }),
  values: z.array(z.string()),
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GoogleSheetsFormValues) => void;
  defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.GOOGLE_SHEETS);

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || "",
      operation: defaultValues.operation || "append",
      spreadsheetId: defaultValues.spreadsheetId || "",
      range: defaultValues.range || "",
      values: defaultValues.values?.length ? defaultValues.values : [""],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || "",
        operation: defaultValues.operation || "append",
        spreadsheetId: defaultValues.spreadsheetId || "",
        range: defaultValues.range || "",
        values: defaultValues.values?.length ? defaultValues.values : [""],
      });
    }
  }, [open, defaultValues, form]);

  const watchVariableName = form.watch("variableName") || "mySheetsResult";
  const watchOperation = form.watch("operation");
  const watchValues = form.watch("values") ?? [];
  const showValues = watchOperation !== "read";

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleValueChange = (index: number, value: string) => {
    form.setValue(
      "values",
      watchValues.map((v, i) => (i === index ? value : v)),
    );
  };

  const handleAppendValue = () => {
    form.setValue("values", [...watchValues, ""]);
  };

  const handleRemoveValue = (index: number) => {
    form.setValue(
      "values",
      watchValues.filter((_, i) => i !== index),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Sheets</DialogTitle>
          <DialogDescription>
            Read from or write to a Google Sheet using a service account
            credential.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="mySheetsData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.googleSheets.values}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Sheets Credential</FormLabel>
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
                              src="/google-sheets.svg"
                              alt="Google Sheets"
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
                    A Google service account credential. Share your sheet with
                    the service account email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an operation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="append">Append Row</SelectItem>
                      <SelectItem value="read">Read Rows</SelectItem>
                      <SelectItem value="update">Update Cell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spreadsheet ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The ID from your spreadsheet URL, or use {"{{variables}}"}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sheet1!A1:C or Sheet1!A1"
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sheet name and range. e.g. {"Sheet1!A1:C"} for rows,{" "}
                    {"Sheet1!A1"} for a single cell.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showValues && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Row Values</FormLabel>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAppendValue}
                  >
                    <PlusIcon className="size-4" />
                    Add cell
                  </Button>
                </div>

                <div className="space-y-2">
                  {watchValues.map((value, index) => (
                    <div
                      key={index}
                      className="flex items-end gap-2 rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <FormLabel className="text-xs">
                          Cell {index + 1}
                        </FormLabel>
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleValueChange(index, e.target.value)
                          }
                          placeholder="John Doe or {{aiOutput.text}}"
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveValue(index)}
                        aria-label="Remove value"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormDescription>
                  One value per cell in the row. Use {"{{variables}}"} for
                  dynamic values. Each row appends a full row.
                </FormDescription>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

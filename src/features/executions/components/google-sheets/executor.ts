import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { GoogleSheetsClient } from "@/lib/google-sheets";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

export type GoogleSheetsOperation = "append" | "read" | "update";

export type GoogleSheetsData = {
  variableName?: string;
  credentialId?: string;
  operation?: GoogleSheetsOperation;
  spreadsheetId?: string;
  range?: string;
  values?: string[];
};

function toMatrix(values: string[]): unknown[][] {
  return [values.map((value) => value.trim())];
}

export const googleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    googleSheetsChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const publishError = async () => {
    await publish(
      googleSheetsChannel().status({
        nodeId,
        status: "error",
      }),
    );
  };

  const requireField = async (
    value: string | undefined,
    message: string,
  ): Promise<string> => {
    if (!value) {
      await publishError();
      throw new NonRetriableError(`Google Sheets node: ${message}`);
    }
    return value;
  };

  const variableName = await requireField(
    data.variableName,
    "Variable name is missing",
  );
  const credentialId = await requireField(
    data.credentialId,
    "Credential is missing",
  );
  const operation = (await requireField(
    data.operation,
    "Operation is missing",
  )) as GoogleSheetsOperation;
  const spreadsheetIdTemplate = await requireField(
    data.spreadsheetId,
    "Spreadsheet ID is missing",
  );
  const rangeTemplate = await requireField(data.range, "Range is missing");

  if (
    (operation === "append" || operation === "update") &&
    !data.values?.length
  ) {
    await publishError();
    throw new NonRetriableError(
      "Google Sheets node: Values are required for this operation",
    );
  }

  const spreadsheetId = Handlebars.compile(spreadsheetIdTemplate)(context);
  const range = Handlebars.compile(rangeTemplate)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publishError();
    throw new NonRetriableError("Google Sheets node: Credential not found");
  }

  const serviceAccountJson = decrypt(credential.value);
  const client = new GoogleSheetsClient(serviceAccountJson);

  try {
    let result: Record<string, unknown>;

    if (operation === "read") {
      result = await step.run("google-sheets-read", () =>
        client.readRows(spreadsheetId, range),
      );
    } else {
      const values = (data.values ?? []).map((value) =>
        Handlebars.compile(value)(context),
      );
      const matrix = toMatrix(values);

      result =
        operation === "append"
          ? await step.run("google-sheets-append", () =>
              client.appendRow(spreadsheetId, range, matrix),
            )
          : await step.run("google-sheets-update", () =>
              client.updateCell(spreadsheetId, range, matrix),
            );
    }

    await publish(
      googleSheetsChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [variableName]: {
        googleSheets: result,
      },
    };
  } catch (error) {
    await publishError();
    throw error;
  }
};

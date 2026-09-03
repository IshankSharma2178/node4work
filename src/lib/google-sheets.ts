import { google } from "googleapis";

export class GoogleSheetsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsApiError";
  }
}

type ServiceAccountCredential = {
  type: "service_account";
  project_id?: string;
  client_email: string;
  private_key: string;
  [key: string]: unknown;
};

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export class GoogleSheetsClient {
  private readonly auth: InstanceType<typeof google.auth.JWT>;

  constructor(serviceAccountJson: string) {
    let parsed: ServiceAccountCredential;

    try {
      parsed = JSON.parse(serviceAccountJson) as ServiceAccountCredential;
    } catch {
      throw new GoogleSheetsApiError(
        "Invalid service account credential: expected valid JSON",
      );
    }

    if (!parsed.client_email || !parsed.private_key) {
      throw new GoogleSheetsApiError(
        "Invalid service account credential: missing client_email or private_key",
      );
    }

    this.auth = new google.auth.JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: [SHEETS_SCOPE],
    });
  }

  async appendRow(
    spreadsheetId: string,
    range: string,
    values: unknown[][],
  ): Promise<Record<string, unknown>> {
    const sheets = google.sheets({ version: "v4", auth: this.auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return {
      spreadsheetId,
      range: response.data.updates?.updatedRange ?? range,
      updatedRows: response.data.updates?.updatedRows ?? 0,
      updatedCells: response.data.updates?.updatedCells ?? 0,
    };
  }

  async readRows(
    spreadsheetId: string,
    range: string,
  ): Promise<Record<string, unknown>> {
    const sheets = google.sheets({ version: "v4", auth: this.auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return {
      spreadsheetId,
      range,
      values: response.data.values ?? [],
    };
  }

  async updateCell(
    spreadsheetId: string,
    range: string,
    values: unknown[][],
  ): Promise<Record<string, unknown>> {
    const sheets = google.sheets({ version: "v4", auth: this.auth });

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return {
      spreadsheetId,
      range: response.data.updatedRange ?? range,
      updatedRows: response.data.updatedRows ?? 0,
      updatedCells: response.data.updatedCells ?? 0,
    };
  }
}

import * as fs from 'fs';
import * as path from 'path';

export interface TestDataRecord {
  scenario: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  address: string;
  city: string;
  country: string;
  cardName: string;
  cardNumber: string;
  cardExp: string;
  cardCvv: string;
  web: {
    username: string;
    password: string;
  };
  mobile: {
    username: string;
    password: string;
  };
}

/**
 * Lightweight, robust CSV parser without external library overhead.
 */
function parseCsv(csvContent: string): Record<string, string>[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Loads test data from `testdata.csv` located at project root or data/ directory.
 */
export function loadAllTestData(): Map<string, TestDataRecord> {
  const rootPath = path.resolve(process.cwd(), 'testdata.csv');
  const dataDirPath = path.resolve(process.cwd(), 'data/testdata.csv');

  const filePath = fs.existsSync(rootPath) ? rootPath : dataDirPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`[TestDataLoader] testdata.csv not found at ${rootPath} or ${dataDirPath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const rawRows = parseCsv(content);
  const dataMap = new Map<string, TestDataRecord>();

  const isAndroid = (process.env.PLATFORM || '').toLowerCase() === 'android';

  for (const row of rawRows) {
    const scenario = row.scenario;
    if (!scenario) continue;

    const webUser = row.web_username || row.username || '';
    const webPass = row.web_password || row.password || '';
    const mobileUser = row.mobile_username || webUser;
    const mobilePass = row.mobile_password || webPass;

    const record: TestDataRecord = {
      scenario,
      username: isAndroid ? mobileUser : webUser,
      password: isAndroid ? mobilePass : webPass,
      firstName: row.first_name || 'John',
      lastName: row.last_name || 'Doe',
      postalCode: row.postal_code || '12345',
      address: row.address || '123 Main Street',
      city: row.city || 'Metropolis',
      country: row.country || 'United States',
      cardName: row.card_name || `${row.first_name || 'John'} ${row.last_name || 'Doe'}`,
      cardNumber: row.card_number || '325812657568789',
      cardExp: row.card_exp || '03/28',
      cardCvv: row.card_cvv || '123',
      web: {
        username: webUser,
        password: webPass,
      },
      mobile: {
        username: mobileUser,
        password: mobilePass,
      },
    };

    dataMap.set(scenario, record);
  }

  return dataMap;
}

/**
 * Get specific test data record by scenario name (e.g. 'standard_user', 'locked_out_user', 'checkout_user')
 */
export function getTestData(scenario: string): TestDataRecord {
  const allData = loadAllTestData();
  const record = allData.get(scenario);
  if (!record) {
    throw new Error(`[TestDataLoader] No record found in testdata.csv for scenario: "${scenario}"`);
  }
  return record;
}


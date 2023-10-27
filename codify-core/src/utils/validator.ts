import { valid as semverValid } from 'semver';

//******************
// Regex
//******************

const urlRegex = /[\w#%+.:=@~-]{1,256}\.[\d()a-z]{1,6}\b([\w#%&()+./:=?@~-]*)/gi;
const nameRegex = /^[$_a-z][\w$]*$/gi;

//*****************
// Validators
//*****************

export function validateTypeString(actual: unknown): actual is string {
  return typeof actual === 'string';
}

export function validateTypeRecordStringUnknown(actual: unknown): actual is Record<string, unknown> | never {
  return typeof actual === 'object';
}

export function validateTypeRecordStringString(actual: unknown): actual is Record<string, string> {
  if (!validateTypeRecordStringUnknown(actual)) {
    return false;
  }

  for (const value of Object.values(actual)) {
    if (typeof value !== 'string') {
      return false;
    }
  }

  return true;
}

export function validateStringEq(actual: unknown, expected: string): actual is string {
  return actual === expected;
}

export function validateNameString(actual: unknown): actual is string {
  return validateTypeString(actual) && actual.match(nameRegex) !== null;
}

export function validateUrl(actual: unknown): actual is string {
  return validateTypeString(actual) && actual.match(urlRegex) !== null;
}

export function validateSemver(actual: unknown): actual is string {
  return validateTypeString(actual) && semverValid(actual) !== null;
}

export function validateAllowedObjectKeys(actual: unknown, allowedKeys: string[]): actual is Record<string, unknown> {
  const keySet = new Set(allowedKeys);

  return validateTypeRecordStringUnknown(actual) && Object.keys(actual).every((k) => keySet.has(k));
}



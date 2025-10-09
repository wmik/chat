import { customAlphabet } from 'nanoid';

export function uid(length = 10) {
  return customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    length
  )();
}

function getRequiredEnvVarFromObj(
  config: Record<string, string | undefined>,
  key: string,
  devValue: string = `${key}-dev-value`
) {
  let value = devValue;
  let envVal = config[key];

  if (envVal) {
    value = envVal;
  } else if (config.NODE_ENV === 'production') {
    throw new Error(`${key} is a required env variable`);
  }

  return value;
}

export function getRequiredServerEnvVar(key: string, devValue?: string) {
  return getRequiredEnvVarFromObj(process.env, key, devValue);
}

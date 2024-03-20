import Ajv2020 from 'ajv/dist/2020.js';

export const ajv = new Ajv2020.default({
  strict: true,
  allErrors: true,
});

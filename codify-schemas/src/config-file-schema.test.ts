import Ajv2020 from "ajv/dist/2020";
import configSchema from './config-file-schema.json';
import resourceSchema from './resource-schema.json';
import assert from "node:assert";

const ajv = new Ajv2020({
  strict: true,
})
ajv.addSchema(resourceSchema);

describe("config file schema tests", () => {
  it('compiles', () => {
    ajv.compile(configSchema);
  })

  it('accepts resource blocks', () => {
    const validator = ajv.compile(configSchema);

    assert.equal(validator([
      {
        "type": "resource1",
      },
      {
        "type": "resource2",
        "name": "abc",
        "prop1": {
          "a": "b",
        },
        "prop2": "c"
      }
    ]), true)

    assert.equal(validator([
      {
        "type": "resource1",
      },
      {}
    ]), false)

    assert.equal(validator([
      {
        "type": "project",
      },
      {
        "type": "resource2"
      }
    ]), true)

  })


})
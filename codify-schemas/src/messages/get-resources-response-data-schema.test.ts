import Ajv2020 from "ajv/dist/2020";
import schema from './get-resources-response-data-schema.json';
import resourceSchema from '../resource-schema.json'
import {it} from "mocha";
import assert from "node:assert";

const ajv = new Ajv2020({
  strict: true,
})
ajv.addSchema(resourceSchema);

describe('Get resources response data schema', () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("requires a type field to be specified", () => {
    const validate = ajv.compile(schema);
    assert.equal(validate({ resources: [
        {
          type: "typeA",
          dependencies: [
            "typeB"
          ]
        },
        {
          type: "typeB"
        }
    ]}), true)
    assert.equal(validate({
      resources: [
        {
          type: "typeA",
          dependencies: [
            "typeB"
          ]
        },
        {}
      ]
    }), false)
  })

})

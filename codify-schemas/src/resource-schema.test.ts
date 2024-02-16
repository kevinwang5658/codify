import Ajv2020 from "ajv/dist/2020";
import { describe, it } from 'mocha';
import schema from './resource-schema.json';
import assert from "node:assert";

const ajv = new Ajv2020({
   strict: true,
})

describe("Resource schema tests", () => {
   it("compiles", () => {
      ajv.compile(schema);
   })

   it("requires a type field to be specified", () => {
      const validate = ajv.compile(schema);
      assert.equal(validate({ type: "type" }), true)
      assert.equal(validate({}), false)
   })

   it ("name and type are alpha-numeric and follow variable naming conventions", () => {
      const validate = ajv.compile(schema);
      assert.equal(validate({ type: "a234abcDEF_-"}), true)
      assert.equal(validate({ type: "234"}), false);
      assert.equal(validate({ type: "ABCDEF$"}), false);

      assert.equal(validate({ type: "type", name: "a234abcDEF_-"}), true)
      assert.equal(validate({ type: "type", name: "234"}), false);
      assert.equal(validate({ type: "type", name: "ABCDEF$"}), false);
   });

   it("dependsOn is an array of unique strings", () => {
      const validate = ajv.compile(schema);
      assert.equal(validate({ type: "type", dependsOn: ["item1", "item2"] }), true)
      assert.equal(validate({ type: "type", dependsOn: ["item1", "item1"] }), false)
      assert.equal(validate({ type: "type", dependsOn: "item1" }), false)
      assert.equal(validate({ type: "type", dependsOn: [6] }), false)
   })
});

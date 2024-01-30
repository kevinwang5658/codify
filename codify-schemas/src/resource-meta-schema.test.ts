import Ajv2020 from "ajv/dist/2020";
import { describe, it } from 'mocha';
import schema from './resource-meta-schema.json';
import resourceSchema from './resource-schema.json';
import assert from "node:assert";

const ajv = new Ajv2020({
   strict: true,
})

describe("Resource meta schema tests", () => {
   it("compiles", () => {
      ajv.compile(schema);
   })

   it("must have additional properties and $ref to resource-schema specified", () => {
      const validate = ajv.compile(schema);

      assert.equal(validate({
         "$schema": "https://json-schema.org/draft/2020-12/schema",
         "type": "object",
         "properties": {
            "prop1": {
               "type": "string"
            }
         }
      }), false);

      assert.equal(validate({
         "$schema": "https://json-schema.org/draft/2020-12/schema",
         "type": "object",
         "properties": {
            "prop1": {
               "type": "string"
            }
         },
         "additionalProperties": false,
         "$ref": "https://www.codify.com/resource-schema.json"
      }), true);
   })

   it("does not allow resource keywords to be specified", () => {
      const validate = ajv.compile(schema);

      assert.equal(validate({
         "$schema": "https://json-schema.org/draft/2020-12/schema",
         "type": "object",
         "properties": {
            "type": {
               "type": "string"
            }
         },
         "additionalProperties": false,
         "$ref": "https://www.codify.com/resource-schema.json"
      }), false);

      assert.equal(validate({
         "$schema": "https://json-schema.org/draft/2020-12/schema",
         "type": "object",
         "properties": {
            "name": {
               "type": "string"
            }
         },
         "additionalProperties": false,
         "$ref": "https://www.codify.com/resource-schema.json"
      }), false);

      assert.equal(validate({
         "$schema": "https://json-schema.org/draft/2020-12/schema",
         "type": "object",
         "properties": {
            "dependsOn": {
               "type": "array"
            }
         },
         "additionalProperties": false,
         "$ref": "https://www.codify.com/resource-schema.json"
      }), false);
   })

   it("allows for schema composition with base resource schema", () => {
      const resourceMetaSchema = schema;
      const propertySchema = {
         $id: "https://www.codify.com/property-schema.json",
         type: "object",
         properties: {
            prop1: {
               type: "string"
            },
            prop2: {
               type: "string"
            },
         },
         $ref: "https://www.codify.com/resource-schema.json",
         unevaluatedProperties: false,
      }

      const resourceConfigInvalid = {
         prop1: "a",
      }

      const resourceConfigValid = {
         type: "resource-config",
         prop1: "a",
         dependsOn: ["resource-config-2"]
      }

      const ajv = new Ajv2020({
         strict: true,
         schemas: [resourceSchema]
      });

      const metaSchemaValidator = ajv.compile(resourceMetaSchema);
      assert.equal(metaSchemaValidator(propertySchema), true)

      const resourceValidator = ajv.compile(propertySchema);
      assert.equal(resourceValidator(resourceConfigValid), true);
      assert.equal(resourceValidator(resourceConfigInvalid), false);
   })
});
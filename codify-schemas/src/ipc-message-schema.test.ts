import Ajv2020 from "ajv/dist/2020";
import { describe, it } from 'mocha';
import schema from './ipc-message-schema.json';
import assert from "node:assert";

const ajv = new Ajv2020({
  strict: true,
})

describe("Ipc message schema tests", () => {
  it("compiles", () => {
    ajv.compile(schema);
  })

  it("requires a msg field to be specified", () => {
    const validate = ajv.compile(schema);
    assert.equal(validate({ msg: "doSomething", data: "data" }), true)
    assert.equal(validate({ data: "data" }), false)
  })

  it("has an optional status field for responses", () => {
    const validate = ajv.compile(schema);
    assert.equal(validate({ msg: "doSomething", status: "success", data: "data" }), true)
    assert.equal(validate({ msg: "doSomething", status: "error", data: "data" }), true)
    assert.equal(validate({ msg: "doSomething", status: "other", data: "data" }), false)
    assert.equal(validate({ msg: "doSomething", data: "data" }), true)
  })

  it ("accepts data or null", () => {
    const validate = ajv.compile(schema);
    assert.equal(validate({ msg: "doSomething", data: "data" }), true)
    assert.equal(validate({ msg: "doSomething", data: null }), true)
    assert.equal(validate({ msg: "doSomething" }), false)
    assert.equal(validate({ msg: "doSomething", data: {} }), true)
  });

});
import Ajv2020 from "ajv/dist/2020";
import schema from './project-schema.json';
import assert from "node:assert";

const ajv = new Ajv2020({
  strict: true,
})

describe("project file schema tests", () => {
  it('compiles', () => {
    ajv.compile(schema);
  })

  it("must have type project", () => {
    const validator = ajv.compile(schema);
    assert.equal(validator({ type: 'project' }), true)
    assert.equal(validator({}), false)
    assert.equal(validator({ type: 'resource' }), false)
  })

  it("plugins must be <string, string>", () => {
    const validator = ajv.compile(schema);
    assert.equal(validator({
      type: 'project',
      plugins: {
        "plugin1": "3.2.3"
      }
    }), true)

    assert.equal(validator({
      type: 'project',
      plugins: {
        "plugin1": 1,
      }
    }), false)

    assert.equal(validator({
      type: 'project',
      plugins: {
        "plugins2": "https://link.to.plugin.com"
      }
    }), true)
  })



})
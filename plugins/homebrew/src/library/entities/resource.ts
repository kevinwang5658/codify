import * as path from "path";
import * as fs from "fs/promises";
import { validateResourceConfig } from "../utils/validators";
import { ResourceDefinition } from "./resource-definition";
import { ResourceParameterPlan } from "./plan";

export abstract class Resource<T extends ResourceDefinition> {

  abstract definitionFileName: string;
  private definition?: ResourceDefinition;

  async initialize(): Promise<void> {}

  async getResourceDefinitions(): Promise<Record<string, unknown>> {
    const dir = path.join(__dirname, '../../../resource-definitions');

    const files = await fs.readdir(dir);
    if (!files.find((name) => name === this.definitionFileName)) {
      throw new Error(`Definition file ${this.definitionFileName} cannot be found. Please define a resource in resource-definitions`)
    }

    const contents = await fs.readFile(path.join(dir, this.definitionFileName), 'utf8');
    const json = JSON.parse(contents);
    this.definition = json as ResourceDefinition;

    // TODO: Add validation for the file

    return json;
  }

  async runGeneratePlanForResource(resourceConfig: unknown): Promise<Record<string, unknown>> {
    if (!this.definition) {
      throw new Error('Internal Error :: getResourceDefinitions must be run before runGeneratePlanForResource')
    }

    if (!validateResourceConfig(resourceConfig, this.definition)) {
      throw new Error();
    }

    return await this.generatePlanForResource(resourceConfig);
  }

  abstract generatePlanForResource(resourceConfig: Record<string, unknown>): Promise<Record<keyof T['parameters'], ResourceParameterPlan>>;

}

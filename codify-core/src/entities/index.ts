export interface Validatable {
  validate(): Promise<boolean>;
}

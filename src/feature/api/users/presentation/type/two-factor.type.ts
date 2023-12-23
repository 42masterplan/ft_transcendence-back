export class TwoFactorType {
  readonly code?: string | null;
  readonly email?: string | null;
  readonly isValidate?: boolean;

  constructor(props: { code?: string; email?: string; isValidate?: boolean }) {
    if (props.code !== undefined) {
      this.code = props.code;
    }
    if (props.email !== undefined) {
      this.email = props.email;
    }
    if (props.isValidate !== null || props.isValidate !== undefined) {
      this.isValidate = props.isValidate;
    }
  }
}

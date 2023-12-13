export class TwoFactorType {
  readonly code: string;
  readonly email: string;
  readonly isValidate: boolean;

  constructor(props: { code: string; email: string; isValidate: boolean }) {
    this.code = props.code;
    this.email = props.email;
    this.isValidate = props.isValidate;
  }
}

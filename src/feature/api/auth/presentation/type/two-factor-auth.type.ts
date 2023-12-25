export class TwoFactorAuthType {
  readonly code?: string | null;
  readonly email?: string | null;
  readonly isEmailValidated?: boolean;
  readonly is2faValidated?: boolean;

  constructor(props: {
    code?: string;
    email?: string;
    isEmailValidated?: boolean;
    is2faValidated?: boolean;
  }) {
    this.code = props.code;
    this.email = props.email;
    this.isEmailValidated = props.isEmailValidated;
    this.is2faValidated = props.is2faValidated;
  }
}

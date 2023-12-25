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
    if (props.code !== undefined) {
      this.code = props.code;
    }
    if (props.email !== undefined) {
      this.email = props.email;
    }
    if (
      props.isEmailValidated !== null ||
      props.isEmailValidated !== undefined
    ) {
      this.isEmailValidated = props.isEmailValidated;
    }
    if (props.is2faValidated !== null || props.is2faValidated !== undefined) {
      this.is2faValidated = props.is2faValidated;
    }
  }
}

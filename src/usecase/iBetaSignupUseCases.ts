export interface BetaSignupInput {
  readonly email: string;
  readonly name?: string;
}

export interface IBetaSignupUseCases {
  register(input: BetaSignupInput): Promise<void>;
}

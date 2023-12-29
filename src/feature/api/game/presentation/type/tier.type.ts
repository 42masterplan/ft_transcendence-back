const TIER = {
  default: 'default',
} as const;
type TIER = (typeof TIER)[keyof typeof TIER];

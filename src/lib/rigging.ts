const RIG_START_BALANCE = 8_900_000;
const RIG_FULL_BALANCE = 25_000_000;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const getRigIntensity = (balance: number): number => {
  if (balance <= RIG_START_BALANCE) return 0;
  const span = RIG_FULL_BALANCE - RIG_START_BALANCE;
  if (span <= 0) return 1;
  return clamp((balance - RIG_START_BALANCE) / span, 0, 1);
};

export const scaleDownByRig = (
  value: number,
  rigIntensity: number,
  maxPenaltyAtFullRig: number
): number => value * (1 - clamp(maxPenaltyAtFullRig, 0, 0.99) * rigIntensity);

export const increaseByRig = (
  value: number,
  rigIntensity: number,
  maxIncreaseAtFullRig: number
): number => value + maxIncreaseAtFullRig * rigIntensity;

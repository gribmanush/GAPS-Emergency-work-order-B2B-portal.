// Real ABN validation using the Australian Taxation Office's published
// modulus-89 check-digit algorithm, replacing a naive "11 characters" length
// check that let through garbage like 11 literal space characters.
//
// Algorithm: strip all spaces, require exactly 11 remaining digits, subtract
// 1 from the value of the first digit, multiply each of the 11 digits by its
// position weight (in order), sum the products, and the ABN is valid only if
// that sum is evenly divisible by 89.
const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

export function isValidAbn(input: string): boolean {
  const stripped = input.replace(/ /g, "");
  if (!/^\d{11}$/.test(stripped)) return false;
  const digits = stripped.split("").map(Number);
  digits[0] -= 1;
  const sum = digits.reduce((total, digit, i) => total + digit * ABN_WEIGHTS[i], 0);
  return sum % 89 === 0;
}

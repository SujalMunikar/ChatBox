// Rivest Shamir Adleman Algorithm  by Abid Adhikari
// Function to perform modular exponentiation
const modExp = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  let result = BigInt(1);
  base = BigInt(base) % BigInt(modulus);
  while (exponent > BigInt(0)) {
    if (BigInt(exponent) % BigInt(2) === BigInt(1)) {
      result = BigInt(result * base) % BigInt(modulus);
    }
    exponent = BigInt(exponent) / BigInt(2);
    base = BigInt(base * base) % BigInt(modulus);
  }
  return result;
};

const decryptMessage = (
  cipherText: string,
  privateKey: [bigint, bigint]
): string => {
  const plainText: string[] = [];
  const cipherArray = cipherText.split("~");
  const d = privateKey[0];
  const n = privateKey[1];
  for (let index = 0; index < cipherArray.length; index++) {
    const cipherNumber = BigInt(cipherArray[index]);
    const plainChar = modExp(cipherNumber, d, n);
    plainText.push(String.fromCharCode(Number(plainChar)));
  }
  const result = plainText.join("");
  return result;
};

export { decryptMessage };

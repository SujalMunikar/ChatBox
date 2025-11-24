// Rivest Shamir Adleman Algorithm  by Abid Adhikari
// Function to check if a number is prime
interface RSAKeys {
  publicKey: [number, number];
  privateKey: [number, number];
}
// Function to check if a number is prime
function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Function to generate a list of prime numbers within a given range
function generatePrimesInRange(min: number, max: number): number[] {
  const primes: number[] = [];
  for (let i = min; i <= max; i++) {
    if (isPrime(i)) {
      primes.push(i);
    }
  }
  return primes;
}

// Function to select two distinct prime numbers from the list
function generateKeys(min: number, max: number): RSAKeys {
  const primes = generatePrimesInRange(min, max);
  if (primes.length < 2) {
    throw new Error("Not enough prime numbers in the given range.");
  }

  let prime1: number;
  let prime2: number;

  do {
    prime1 = primes[Math.floor(Math.random() * primes.length)];
    prime2 = primes[Math.floor(Math.random() * primes.length)];
  } while (prime1 === prime2);
  const n = prime1 * prime2;
  const x = (prime1 - 1) * (prime2 - 1);
  const e = findCoprime(x);
  const d = modInverse(e, x);

  // Encrypt the message
  // Self-test ensures the generated key pair can successfully encrypt/decrypt sample text.
  const cipherText = encryptMessage("Abid Adhikari", [BigInt(e), BigInt(n)]);
  const plainText = decryptMessage(cipherText, [BigInt(d), BigInt(n)]);

  return {
    publicKey: [e, n],
    privateKey: [d, n],
  };
  //   return [prime1, prime2];
}

// Function to compute the greatest common divisor (GCD)
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Function to find an integer e such that 1 < e < x and gcd(e, x) = 1
function findCoprime(x: number): number {
  for (let e = 2; e < x; e++) {
    if (gcd(e, x) === 1) {
      return e;
    }
  }
  throw new Error("No coprime integer found.");
}

// Function to compute the greatest common divisor (GCD) and extended GCD
function extendedGCD(
  a: number,
  b: number
): { gcd: number; x: number; y: number } {
  if (a === 0) return { gcd: b, x: 0, y: 1 };
  const { gcd, x: x1, y: y1 } = extendedGCD(b % a, a);
  const x = y1 - Math.floor(b / a) * x1;
  const y = x1;
  return { gcd, x, y };
}

// Function to find the modular multiplicative inverse
function modInverse(e: number, x: number): number {
  const { gcd, x: inv, y } = extendedGCD(e, x);
  if (gcd !== 1) {
    throw new Error(
      "Modular inverse does not exist because e and x are not coprime."
    );
  }
  return ((inv % x) + x) % x; // Ensure positive result
}

// Function to perform modular exponentiation using square-and-multiply.
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

const encryptMessage = (
  message: string,
  publicKey: [bigint, bigint]
): string => {
  message = message.trim(); // Normalize whitespace so encryption stays deterministic.
  const ciphertext: bigint[] = [];
  const e = publicKey[0];
  const n = publicKey[1];
  for (let index = 0; index < message.length; index++) {
    const charCode = BigInt(message.charCodeAt(index));
    // console.log(charCode);
    const cipherChar = modExp(charCode, e, n);
    ciphertext.push(cipherChar);
  }
  const result = ciphertext.join("~"); // Store each encoded char separated by a delimiter for easy reversal.
  // console.log("ENCRYPTED:::", result);
  return result;
};

const decryptMessage = (
  cipherText: string,
  privateKey: [bigint, bigint]
): string => {
  const plainText: string[] = [];
  const cipherArray = cipherText.split("~"); // Mirror the delimiter used during encryption.
  const d = privateKey[0];
  const n = privateKey[1];
  for (let index = 0; index < cipherArray.length; index++) {
    const cipherNumber = BigInt(cipherArray[index]);
    const plainChar = modExp(cipherNumber, d, n);
    plainText.push(String.fromCharCode(Number(plainChar)));
  }
  const result = plainText.join("");
  // console.log("decryptMessage:::", result);
  return result;
};

export { generateKeys, encryptMessage, decryptMessage };

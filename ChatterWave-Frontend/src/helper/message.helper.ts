import { badWords } from "../constants/badWords";

// Lightweight front-end filter that replaces matched bad words with asterisks before displaying the message.
export const censorMessage = (message: string) => {
  console.log(badWords, badWords.includes("bitch"));
  message = message
    .toLowerCase()
    .split(" ")
    .map((word: string) => {
      if (badWords.includes(word)) {
        const censoredWord = [...Array(word.length)].map(() => "*").join("");
        return censoredWord;
      } else return word;
    })
    .join(" ");
  return message;
};

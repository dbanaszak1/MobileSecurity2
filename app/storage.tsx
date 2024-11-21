import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';


const NOTE_KEY = 'user_note';
const PASSWORD_KEY = 'user_password';

// Generate hash for password using SHA256
export const storePassword = async (password: string) => {
  console.log('Storing password');
  const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex); // Hashowanie hasła
  console.log(hash);
  await SecureStore.setItemAsync(PASSWORD_KEY, hash);
};

// Verify password by comparing the hash
export const verifyPassword = async (password: string) => {
  const storedHash = await SecureStore.getItemAsync(PASSWORD_KEY);
  if (!storedHash) return false;
  const passwordHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex); // Hashowanie do porównania
  return passwordHash === storedHash; // Porównanie haszy
};


// Store encrypted note using CBC mode with a random IV
export const storeNote = async (note: string, password: string) => {
    console.log("\nSTORE NOTE")
  console.log('Storing note');
  console.log('Note:', note);
  console.log("Password:",  password);
  try {
    // Generate random IV using expo-crypto
    const randomBytes = await Crypto.getRandomBytesAsync(16); // 128-bit IV
    const iv = CryptoJS.lib.WordArray.create(randomBytes); // Konwertuj na WordArray
    console.log('IV generated:', iv.toString(CryptoJS.enc.Hex));

    // Encrypt note using password and IV
    const encrypted = CryptoJS.AES.encrypt(note, CryptoJS.enc.Utf8.parse(password.toString()), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Concatenate IV and ciphertext for storage
    const encryptedNote = iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('Encrypted Note:', encryptedNote);

    await SecureStore.setItemAsync(NOTE_KEY, encryptedNote);
    console.log('Note stored successfully');
  } catch (error) {
    console.error('Error storing note:', error);
  }
};



export const getNote = async (password: string) => {
  const encryptedNote = await SecureStore.getItemAsync(NOTE_KEY);
  console.log("\nGET NOTE");
  console.log('Password:', password);
  console.log('Encrypted note:', encryptedNote);

  if (encryptedNote) {
    try {
      // Split IV and ciphertext
      const [ivHex, ciphertextHex] = encryptedNote.split(':');
      
      if (!ivHex || !ciphertextHex) {
        console.error('Error: IV or ciphertext is missing.');
        return null; // Return null if IV or ciphertext is missing
      }

      // Parse IV and ciphertext from Hex
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
      console.log('Parsed IV:', iv.toString(CryptoJS.enc.Hex));
      console.log('Parsed ciphertext:', ciphertext.toString(CryptoJS.enc.Hex));
      // Decrypt note
      const decrypted = CryptoJS.AES.decrypt(
        CryptoJS.lib.CipherParams.create({
          ciphertext: ciphertext,
          iv: iv
        }),
        CryptoJS.enc.Utf8.parse(password.toString()), //JSON.stringify fix
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      console.log('Decrypted:', decrypted);
      const decryptedWordArray = decrypted.words;
      console.log('Decrypted:', decryptedWordArray);
            
      // Convert decrypted result to UTF-8 and return
      const decryptedNote = decrypted.toString(CryptoJS.enc.Utf8);
      if (decryptedNote) {
        console.log('Decrypted note:', decryptedNote);
        return decryptedNote;
      } else {
        console.error('Error: Decrypted note is empty.');
        return null; // Return null if decryption failed
      }

    } catch (error) {
      console.error('Error decrypting note:', error);
      return null; // Return null if decryption fails
    }
  }

  return null; // Return null if no encrypted note is found
};


// Check if password exists (used on first app launch)
export const isPasswordSet = async () => {
  console.log('Checking password');
  const passwordHash = await SecureStore.getItemAsync(PASSWORD_KEY);
  return passwordHash !== null;
};

export default { storePassword, verifyPassword, storeNote, getNote, isPasswordSet };

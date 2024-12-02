import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import * as Crypto from 'expo-crypto';


const NOTE_KEY = 'user_note';
const PASSWORD_KEY = 'user_password';

// Generate hash - SHA256
export const storePassword = async (password: string) => {
  console.log('Storing password');
  const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex); // Creating hash
  console.log(hash);
  await SecureStore.setItemAsync(PASSWORD_KEY, hash);
};

// Verify password
export const verifyPassword = async (password: string) => {
  const storedHash = await SecureStore.getItemAsync(PASSWORD_KEY);
  if (!storedHash) return false;
  const passwordHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  return passwordHash === storedHash; 
};


// Store encrypted note - CBC mode - random IV - salt
export const storeNote = async (note: string, password: string) => {
  console.log("\nSTORE NOTE");
  console.log('Storing note');
  console.log('Note:', note);
  console.log("Password:", password);

  try {
    // GenerateIV
    const ivBytes = await Crypto.getRandomBytesAsync(16);
    const iv = CryptoJS.lib.WordArray.create(ivBytes);
    console.log('IV generated:', iv.toString(CryptoJS.enc.Hex));

    // Generate salt
    const saltBytes = await Crypto.getRandomBytesAsync(16);
    const salt = CryptoJS.lib.WordArray.create(saltBytes); 
    console.log('Salt generated:', salt.toString(CryptoJS.enc.Hex));

    // Derive key
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32, // 256-bit
      iterations: 1000, 
    });
    console.log('Key derived:', key.toString(CryptoJS.enc.Hex));

    // Encrypt note using key and IV
    const encrypted = CryptoJS.AES.encrypt(note, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Concatenate to storage
    const encryptedNote = salt.toString(CryptoJS.enc.Hex) + ':' + iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('Encrypted Note:', encryptedNote);

    await SecureStore.setItemAsync(NOTE_KEY, encryptedNote);
    console.log('Note stored successfully');
  } catch (error) {
    console.error('Error storing note:', error);
  }
};



// Decrypt note
export const getNote = async (password: string) => {
  const encryptedNote = await SecureStore.getItemAsync(NOTE_KEY);
  console.log("\nGET NOTE");
  console.log('Password:', password);
  console.log('Encrypted note:', encryptedNote);

  if (encryptedNote) {
    try {
      // Split salt, IV, and ciphertext
      const [saltHex, ivHex, ciphertextHex] = encryptedNote.split(':');

      if (!saltHex || !ivHex || !ciphertextHex) {
        console.error('Error: Salt, IV, or ciphertext is missing.');
        return null; // Return null if any part is missing
      }

      // Parse salt, IV, and ciphertext from Hex
      const salt = CryptoJS.enc.Hex.parse(saltHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex);
      console.log('Parsed Salt:', salt.toString(CryptoJS.enc.Hex));
      console.log('Parsed IV:', iv.toString(CryptoJS.enc.Hex));
      console.log('Parsed Ciphertext:', ciphertext.toString(CryptoJS.enc.Hex));

      // KEY
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32, // 256-bit key
        iterations: 1000,  // Iterations
      });
      console.log('Derived Key:', key.toString(CryptoJS.enc.Hex));

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        {
          ciphertext: ciphertext, // Ciphertext as WordArray
        },
        key,
        {
          iv: iv, // IV
          mode: CryptoJS.mode.CBC, // CBC mode
          padding: CryptoJS.pad.Pkcs7, // PKCS7 padding
        }
      );

      // Convert decrypted result to UTF-8
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

  console.log('No encrypted note found.');
  return null; // Return null if no encrypted note is found
};


// Check if password exists- first launch
export const isPasswordSet = async () => {
  console.log('Checking password');
  const passwordHash = await SecureStore.getItemAsync(PASSWORD_KEY);
  return passwordHash !== null;
};

export default { storePassword, verifyPassword, storeNote, getNote, isPasswordSet };

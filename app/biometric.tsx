import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

export const store_key = async (password: string) => {
  console.log("\nSTORE KEY");
  console.log('Storing password securely');

  try {
    // Cheking fingerprint
    const biometricAuth = await LocalAuthentication.authenticateAsync();

    if (!biometricAuth.success) {
      throw new Error('Biometric authentication failed.');
    }

    // Random key and save in secure store (key is not a real biometric key ://)
    const biometricKey = await Crypto.getRandomBytesAsync(32);
    await SecureStore.setItemAsync('biometricKey', JSON.stringify(Array.from(biometricKey))); 

    // Random IV
    const ivBytes = await Crypto.getRandomBytesAsync(16);
    const iv = CryptoJS.lib.WordArray.create(ivBytes);
    console.log('IV generated:', iv.toString(CryptoJS.enc.Hex));

    // Salt
    const saltBytes = await Crypto.getRandomBytesAsync(16);
    const salt = CryptoJS.lib.WordArray.create(saltBytes);
    console.log('Salt generated:', salt.toString(CryptoJS.enc.Hex));

    // Encryoting password
    const key = CryptoJS.lib.WordArray.create(biometricKey);
    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Cat salt + iv + encrypted password
    const encryptedPassword = salt.toString(CryptoJS.enc.Hex) + ':' + iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('Encrypted Password:', encryptedPassword);

    // Save all in secure store
    await SecureStore.setItemAsync('encryptedPassword', encryptedPassword);
    console.log('Password stored securely');
  } catch (error) {
    console.error('Error storing password:', error);
    throw error;
  }
};


export const get_key = async () => {
    console.log("\nGET KEY");
  
    try {
    // Cheking fingerprint
      const biometricAuth = await LocalAuthentication.authenticateAsync();
  
      if (!biometricAuth.success) {
        throw new Error('Biometric authentication failed.');
      }
  
      // Get pswd from secure store
      const encryptedPassword = await SecureStore.getItemAsync('encryptedPassword');
      if (!encryptedPassword) {
        throw new Error('No encrypted password found.');
      }
      console.log('Encrypted password:', encryptedPassword);
  
      // Get encrypted data
      const [saltHex, ivHex, cipherTextHex] = encryptedPassword.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const cipherText = CryptoJS.enc.Hex.parse(cipherTextHex);
  
      // Get key - 'biometricKey' from secure store
      const biometricKey = await SecureStore.getItemAsync('biometricKey');
      if (!biometricKey) {
        throw new Error('No key found.');
      }
      const key = CryptoJS.lib.WordArray.create(Uint8Array.from(JSON.parse(biometricKey))); // Klucz biometryczny
  
      // Decrypt password - AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherText }, 
      key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
  
      // Convert password to string
      const decryptedPassword = decrypted.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedPassword) {
        throw new Error('Failed to decrypt password.');
      }
  
      console.log('Decrypted Password:', decryptedPassword);
      return decryptedPassword; // Return decrypted password
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  export default { store_key, get_key };
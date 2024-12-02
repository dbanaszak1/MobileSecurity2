import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

export const store_key = async (password: string) => {
  console.log("\nSTORE KEY");
  console.log('Storing password securely');

  try {
    // Autoryzacja biometryczna
    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to store your password securely',
    });

    if (!biometricAuth.success) {
      throw new Error('Biometric authentication failed.');
    }

    // Generowanie losowego klucza biometrycznego (256-bitowy klucz AES) tylko raz (przy pierwszej autentykacji)
    const biometricKey = await Crypto.getRandomBytesAsync(32);
    await SecureStore.setItemAsync('biometricKey', JSON.stringify(Array.from(biometricKey))); // Zapisanie klucza w SecureStore

    // Generowanie losowego IV (128-bitowy IV)
    const ivBytes = await Crypto.getRandomBytesAsync(16);
    const iv = CryptoJS.lib.WordArray.create(ivBytes);
    console.log('IV generated:', iv.toString(CryptoJS.enc.Hex));

    // Generowanie losowej soli (128-bitowa sól)
    const saltBytes = await Crypto.getRandomBytesAsync(16);
    const salt = CryptoJS.lib.WordArray.create(saltBytes);
    console.log('Salt generated:', salt.toString(CryptoJS.enc.Hex));

    // Szyfrowanie hasła przy użyciu AES-256-CBC z wykorzystaniem klucza i IV
    const key = CryptoJS.lib.WordArray.create(biometricKey); // Klucz biometryczny
    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Łączenie soli, IV i szyfrogramu do przechowywania
    const encryptedPassword = salt.toString(CryptoJS.enc.Hex) + ':' + iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    console.log('Encrypted Password:', encryptedPassword);

    // Zapisanie zaszyfrowanego hasła w SecureStore
    await SecureStore.setItemAsync('encryptedPassword', encryptedPassword);
    console.log('Password stored securely');
  } catch (error) {
    console.error('Error storing password:', error);
    throw error;
  }
};


export const get_key = async () => {
    console.log("\nRETRIEVE KEY");
    console.log('Retrieving password securely');
  
    try {
      // Autoryzacja biometryczna
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to retrieve your password',
      });
  
      if (!biometricAuth.success) {
        throw new Error('Biometric authentication failed.');
      }
  
      // Pobranie zaszyfrowanego hasła z SecureStore
      const encryptedPassword = await SecureStore.getItemAsync('encryptedPassword');
      if (!encryptedPassword) {
        throw new Error('No encrypted password found.');
      }
      console.log('Encrypted password retrieved:', encryptedPassword);
  
      // Podział zaszyfrowanego hasła na sól, IV i szyfrogram
      const [saltHex, ivHex, cipherTextHex] = encryptedPassword.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltHex);
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const cipherText = CryptoJS.enc.Hex.parse(cipherTextHex);
  
      // Pobranie zapisanego klucza biometrycznego z SecureStore
      const biometricKey = await SecureStore.getItemAsync('biometricKey');
      if (!biometricKey) {
        throw new Error('No biometric key found.');
      }
      const key = CryptoJS.lib.WordArray.create(Uint8Array.from(JSON.parse(biometricKey))); // Klucz biometryczny
  
      // Odszyfrowanie hasła przy użyciu AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherText }, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
  
      // Konwersja odszyfrowanego hasła do tekstu
      const decryptedPassword = decrypted.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedPassword) {
        throw new Error('Failed to decrypt password.');
      }
  
      console.log('Decrypted Password:', decryptedPassword);
      return decryptedPassword; // Zwrócenie odszyfrowanego hasła
    } catch (error) {
      console.error('Error retrieving password:', error);
      throw error;
    }
  };

  export default { store_key, get_key };
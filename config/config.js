export const config = {
      connexion: {
          user: 'root',
          password: '',
          host: 'localhost',
          database: 'coris_app'
      },
      secret: 'THIS IS USED TO SIGN AND VERIFY JWT TOKENS, SONABHY GAS SALE BY BURK, IT CAN BE ANY STRING 07/07/2021'
  };
  
  // Export named constants
  export const { secret } = config;
  export const { connexion } = config;
  
  export default config;
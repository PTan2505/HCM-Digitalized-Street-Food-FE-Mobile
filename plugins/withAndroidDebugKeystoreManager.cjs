/* eslint-disable no-undef */
// plugins/withAndroidDebugKeystoreManager.cjs
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withAppBuildGradle } = require('@expo/config-plugins');

const KEYSTORE_CONFIG = {
  storeFile: '../../development-manager.jks',
  storePassword: '767cfca03265b00fc5aad5dd10d971c6',
  keyAlias: '8e4c924225e3dbc2f8cf6e2900835431',
  keyPassword: '88f2b22f39bf760807bac8af0b3f8dd6',
};

const withAndroidDebugKeystoreManager = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const buildGradle = config.modResults.contents;

      const replacement = `
            debug {
                storeFile file('${KEYSTORE_CONFIG.storeFile}')
                storePassword '${KEYSTORE_CONFIG.storePassword}'
                keyAlias '${KEYSTORE_CONFIG.keyAlias}'
                keyPassword '${KEYSTORE_CONFIG.keyPassword}'
            }
      `;

      if (
        !buildGradle.includes(`storeFile file('${KEYSTORE_CONFIG.storeFile}')`)
      ) {
        config.modResults.contents =
          buildGradle +
          `
          android {
              signingConfigs {
                  ${replacement}
              }
          }
        `;
      }
    }
    return config;
  });
};

module.exports = withAndroidDebugKeystoreManager;

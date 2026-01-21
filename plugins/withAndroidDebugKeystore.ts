// plugins/withAndroidDebugKeystore.ts
import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins';

// THÔNG TIN KEYSTORE TỪ EAS (Đã điền sẵn)
const KEYSTORE_CONFIG = {
  storeFile: '../../development.jks',
  storePassword: '66c2f87d33adbfdb83bc2004fdde639e',
  keyAlias: 'b389cf35c8b51dc74d07a3c7d0c3a0af',
  keyPassword: '442a3e9a71b78e21fac6ef9877a5bfc9',
};

const withAndroidDebugKeystore: ConfigPlugin = (config) => {
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

export default withAndroidDebugKeystore;

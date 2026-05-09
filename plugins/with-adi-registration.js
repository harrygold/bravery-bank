const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

// Copies assets/adi-registration.properties into the generated native
// Android project so it ends up bundled at runtime under
// android/app/src/main/assets/adi-registration.properties.
const withAdiRegistration = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const platformProjectRoot = cfg.modRequest.platformProjectRoot;

      // Source: file checked into the repo under assets/.
      const sourcePath = path.join(
        projectRoot,
        'assets',
        'adi-registration.properties'
      );

      // Destination: native Android assets folder inside the generated project.
      const destDir = path.join(
        platformProjectRoot,
        'app',
        'src',
        'main',
        'assets'
      );
      const destPath = path.join(destDir, 'adi-registration.properties');

      // Fail loudly if the source file is missing so misconfiguration is
      // caught at prebuild time rather than producing a broken native build.
      if (!fs.existsSync(sourcePath)) {
        throw new Error(
          `[with-adi-registration] Missing source file at ${sourcePath}. ` +
            `Expected assets/adi-registration.properties to exist at the project root.`
        );
      }

      // Make sure the target assets directory exists, then copy the file.
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sourcePath, destPath);

      return cfg;
    },
  ]);
};

module.exports = withAdiRegistration;

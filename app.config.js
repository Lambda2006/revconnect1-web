const baseConfig = require('./app.json');

module.exports = () => {
  const config = JSON.parse(JSON.stringify(baseConfig));

  // Replace the $(MAPBOX_SECRET_TOKEN) placeholder with the actual env var.
  // process.env is populated by EAS from the project secret at build time.
  const plugins = config.expo.plugins;
  for (let i = 0; i < plugins.length; i++) {
    if (Array.isArray(plugins[i]) && plugins[i][0] === '@rnmapbox/maps') {
      plugins[i][1].RNMapboxMapsDownloadToken = process.env.MAPBOX_SECRET_TOKEN || '';
      break;
    }
  }

  return config;
};

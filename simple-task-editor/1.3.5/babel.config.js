module.exports = function (api) {
  api.cache(true);

  const presets = [
    "@babel/react"
  ];

  const plugins = [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-classes"
  ];

  return {
    presets,
    plugins
  };
}

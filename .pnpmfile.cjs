module.exports = {
  hooks: {
    readPackage(pkg) {
      // Allow all packages to run scripts
      return pkg;
    }
  }
};

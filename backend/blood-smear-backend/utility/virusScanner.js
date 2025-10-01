const NodeClam = require("clamscan");

let clamAV = null;

async function initClamAV() {
  if (clamAV) return clamAV;

  clamAV = await new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    clamdscan: {
      socket: false,
      host: "127.0.0.1",
      port: 3310,
      timeout: 120000,
    },
  });

  return clamAV;
}

async function scanFileForVirus(filePath) {
  const clam = await initClamAV();
  const { isInfected, viruses } = await clam.scanFile(filePath);
  return { isInfected, viruses };
}

module.exports = { scanFileForVirus };

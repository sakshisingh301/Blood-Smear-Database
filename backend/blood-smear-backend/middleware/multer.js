// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// // Standard Cell Types
// const CELL_TYPES = [
//   "Neutrophil",
//   "Eosinophil",
//   "Basophil",
//   "Lymphocyte",
//   "Monocyte",
//   "Erythrocyte",
//   "Platelet",
//   "Band cell",
//   "Atypical lymphocyte",
//   "Blast cell",
// ];

// //function to check for any directory to exist
// const isDirExists = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// const storingImagesInTempFolder = (req, files) => {
//   const baseDir = path.join(__dirname, "..", "upload");
//   const fullSlideDir = path.join(baseDir, "fullSlideImage");
//   isDirExists(fullSlideDir);
//   const cellavisionDir = path.join(baseDir, "cellavision");
//   isDirExists(cellavisionDir);
//   multer.diskStorage({
//     destination: (req, file, cb) => {},
//   });
// };

// import "dotenv/config";
// import app from "./app.js";
// import { connectDB } from "./config/database.js";

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// startServer();

// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // frontend serve karo
// app.use(express.static(path.join(__dirname, "dist")));

// // react routing support
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

// // import "dotenv/config";
// // import app from "./app.js";
// // import { connectDB } from "./config/database.js";

// // // 🔽 ADD THESE IMPORTS
// // import path from "path";
// // import { fileURLToPath } from "url";

// // // 🔽 REQUIRED FOR __dirname (ES module)
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // const PORT = process.env.PORT || 5000;

// // const startServer = async () => {
// //   try {
// //     await connectDB();

// //     // 🔥 SERVE FRONTEND (React build)
// //     app.use(express.static(path.join(__dirname, "dist")));

// //     // 🔥 React routing support (IMPORTANT)
// //     app.get("*", (req, res) => {
// //       res.sendFile(path.join(__dirname, "dist", "index.html"));
// //     });

// //     app.listen(PORT, () => {
// //       console.log(`Server running on port ${PORT}`);
// //       console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
// //     });
// //   } catch (error) {
// //     console.error("Failed to start server:", error);
// //     process.exit(1);
// //   }
// // };

// // startServer();

import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import express from "express";

// 🔽 ADD THESE IMPORTS
import path from "path";
import { fileURLToPath } from "url";

// 🔽 REQUIRED FOR __dirname (ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // 🔥 SERVE FRONTEND (React build)
    app.use(express.static(path.join(__dirname, "dist")));

    // 🔥 React routing support (IMPORTANT)
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

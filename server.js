require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3900;


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); 
  });


process.on("unhandledRejection", (err) => {
  logger.error(" Unhandled Rejection:", err.message);
  process.exit(1);
});
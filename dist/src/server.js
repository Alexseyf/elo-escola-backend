"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const PORT = env_1.env.PORT;
app_1.app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env_1.env.NODE_ENV} mode`);
});

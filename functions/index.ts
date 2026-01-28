import handler, {
    getAppConfig,
    setAppConfig,
    AppConfig,
    ConfigureMessages,
    extractDuplicateField,
} from "./handler/index";

import middleware, {
    generateSecret,
    generatedSecret,
    signToken,
    verifyTokenMiddleware,
    ErrorHandler,
} from "./middleware/index";
import security, {
    hashData,
    verifyHash,
    hashDataWithRandomSalt,
    hashPassword,
    verifyPassword,
    encryptData,
    decryptData,
} from "./security";
import util, { Coloredlog } from "./util/index";

const functions = {
    handler,
    middleware,
    security,
    util,
};
export default functions;

export { handler, middleware, security, util };

export {
    // #region Handler Exports
    getAppConfig,
    extractDuplicateField,
    setAppConfig,
    AppConfig,
    ConfigureMessages,
    // #endregion
    // #region Middleware Exports
    generateSecret,
    generatedSecret,
    signToken,
    verifyTokenMiddleware,
    ErrorHandler,
    // #endregion
    // #region Security Exports
    hashData,
    verifyHash,
    hashDataWithRandomSalt,
    hashPassword,
    verifyPassword,
    encryptData,
    decryptData,
    // #endregion
    // #region Utility Exports
    Coloredlog,
    // #endregion
};

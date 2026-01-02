/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {uploadImage} = require("./src/uploadImage");
const {getProducts, getProduct} = require("./src/getProducts");
const {setupTestData} = require("./src/setupTestData");
const {getTestToken} = require("./src/getTestToken");
const {updateUserPreferences} = require("./src/updateUserPreferences");
const {adminLogin} = require("./src/adminLogin");
const {createAdminUser} = require("./src/createAdminUser");
const {verifyAppleLogin} = require("./src/verifyAppleLogin");
const {verifyGoogleLogin} = require("./src/verifyGoogleLogin");
const {exchangeGoogleCode} = require("./src/exchangeGoogleCode");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
exports.uploadImage = uploadImage;
exports.getProducts = getProducts;
exports.getProduct = getProduct;
exports.setupTestData = setupTestData;
exports.getTestToken = getTestToken;
exports.updateUserPreferences = updateUserPreferences;
exports.adminLogin = adminLogin;
exports.createAdminUser = createAdminUser;
exports.verifyAppleLogin = verifyAppleLogin;
exports.verifyGoogleLogin = verifyGoogleLogin;
exports.exchangeGoogleCode = exchangeGoogleCode;

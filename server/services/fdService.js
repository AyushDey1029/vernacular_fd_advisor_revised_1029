/**
 * fdService.js
 * Encapsulates FD-specific logic and responses.
 */

const { getTranslator, formatScript } = require('../utils/translator');

/**
 * Returns response for starting a new FD.
 * @param {string} language 
 * @param {string} scriptType 
 */
function getFDStartFlow(language, scriptType) {
  const t = getTranslator(language);
  const rawText = t("fd_start_flow");
  return formatScript(rawText, scriptType, language);
}

/**
 * Returns general FD explanation — fully hardcoded, no API calls.
 * Picks the pre-written native or roman key directly from i18n JSON.
 * @param {string} language
 * @param {string} scriptType - 'native' | 'roman'
 */
function getFDExplanation(language, scriptType) {
  const t = getTranslator(language);
  // Use the roman-specific key when roman script is requested
  const key = scriptType === 'roman' ? 'fd_explain_roman' : 'fd_explain';
  return t(key);
}

/**
 * Returns FD interest rate information.
 * @param {string} language 
 * @param {string} scriptType 
 */
function getFDRateInfo(language, scriptType) {
  const t = getTranslator(language);
  const rawText = t("fd_rate_info");
  return formatScript(rawText, scriptType, language);
}

module.exports = {
  getFDStartFlow,
  getFDExplanation,
  getFDRateInfo,
};

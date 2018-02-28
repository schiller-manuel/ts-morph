import {ManipulationSettingsContainer} from "./../ManipulationSettings";
import {ts} from "./../typescript";
import {FormatCodeSettings} from "./../compiler";
import {setValueIfUndefined} from "./setValueIfUndefined";
import {fillDefaultEditorSettings} from "./fillDefaultEditorSettings";

export function fillDefaultFormatCodeSettings(settings: FormatCodeSettings, manipulationSettings: ManipulationSettingsContainer) {
    fillDefaultEditorSettings(settings, manipulationSettings);
    setValueIfUndefined(settings, "insertSpaceAfterCommaDelimiter", true);
    setValueIfUndefined(settings, "insertSpaceAfterConstructor", false);
    setValueIfUndefined(settings, "insertSpaceAfterSemicolonInForStatements", false);
    setValueIfUndefined(settings, "insertSpaceAfterKeywordsInControlFlowStatements", true);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", false);
    setValueIfUndefined(settings, "insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", false);
    setValueIfUndefined(settings, "insertSpaceBeforeFunctionParenthesis", false);
    setValueIfUndefined(settings, "insertSpaceAfterSemicolonInForStatements", true);
    setValueIfUndefined(settings, "insertSpaceBeforeAndAfterBinaryOperators", true);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForFunctions", false);
    setValueIfUndefined(settings, "placeOpenBraceOnNewLineForControlBlocks", false);
    setValueIfUndefined(settings, "ensureNewLineAtEndOfFile", true);
}

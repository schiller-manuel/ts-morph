import { ts } from "../../../typescript";
import { JSDocPropertyLikeTag } from "./base";
import { JSDocTag } from "./JSDocTag";

export const JSDocPropertyTagBase = JSDocPropertyLikeTag(JSDocTag);
/**
 * JS doc property tag node.
 */
export class JSDocPropertyTag extends JSDocPropertyTagBase<ts.JSDocPropertyTag> {
}

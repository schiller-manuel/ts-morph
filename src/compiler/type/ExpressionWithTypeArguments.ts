﻿import * as ts from "typescript";
import {Node} from "./../common";
import {TypeNode} from "./TypeNode";

export class ExpressionWithTypeArguments extends TypeNode<ts.ExpressionWithTypeArguments> {
    /**
     * Gets the expression node.
     */
    getExpression(): Node<ts.LeftHandSideExpression> {
        return this.factory.getNodeFromCompilerNode(this.node.expression, this.sourceFile) as Node<ts.LeftHandSideExpression>;
    }

    /**
     * Gets the type arguments.
     */
    getTypeArguments(): TypeNode[] {
        const typeArguments = this.node.typeArguments;
        if (typeArguments == null)
            return [];

        return typeArguments.map(a => this.factory.getTypeNode(a, this.sourceFile));
    }
}
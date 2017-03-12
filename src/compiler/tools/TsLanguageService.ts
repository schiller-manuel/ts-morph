﻿import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import {CompilerFactory} from "./../../factories";
import {KeyValueCache} from "./../../utils";
import {SourceFile} from "./../file";
import {Node, Identifier} from "./../common";
import {TsProgram} from "./TsProgram";

export interface SourceFileReplace {
    sourceFile: SourceFile;
    textSpans: TextSpan[];
}

export interface TextSpan {
    start: number;
    length: number;
}

export class TsLanguageService {
    private readonly languageService: ts.LanguageService;
    private readonly sourceFiles: SourceFile[] = [];
    private readonly compilerHost: ts.CompilerHost;
    private compilerFactory: CompilerFactory;

    constructor(private readonly compilerOptions: ts.CompilerOptions) {
        let version = 0;
        const languageServiceHost: ts.LanguageServiceHost = {
            getCompilationSettings: () => compilerOptions,
            getNewLine: () => this.getNewLine(),
            getScriptFileNames: () => this.sourceFiles.map(s => s.getFileName()),
            getScriptVersion: fileName => {
                return (version++).toString();
            },
            getScriptSnapshot: fileName => {
                return ts.ScriptSnapshot.fromString(this.compilerFactory.getSourceFileFromFilePath(fileName)!.getFullText());
            },
            getCurrentDirectory: () => "",
            getDefaultLibFileName: options => ts.getDefaultLibFilePath(compilerOptions),
            useCaseSensitiveFileNames: () => true,
            readFile: (path, encoding) => {
                console.log("READING");
                return this.compilerFactory.getSourceFileFromFilePath(path)!.getFullText();
            },
            fileExists: path => this.compilerFactory.getSourceFileFromFilePath(path) != null,
            directoryExists: dirName => {
                console.log(`Checking dir exists: ${dirName}`);
                return true;
            }
        };

        this.compilerHost = {
            getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => {
                return this.compilerFactory.getSourceFileFromFilePath(fileName).getCompilerNode();
            },
            // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
            // getDefaultLibLocation: (...) => {},
            getDefaultLibFileName: (options: ts.CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
            writeFile: () => {
                console.log("ATTEMPT TO WRITE FILE");
            },
            getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
            getDirectories: (path: string) => {
                console.log("ATTEMPT TO GET DIRECTORIES");
                return [];
            },
            fileExists: (fileName: string) => languageServiceHost.fileExists!(fileName),
            readFile: (fileName: string) => languageServiceHost.readFile!(fileName),
            getCanonicalFileName: (fileName: string) => path.normalize(fileName),
            useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames!(),
            getNewLine: () => languageServiceHost.getNewLine!(),
            getEnvironmentVariable: (name: string) => process.env[name]
        };

        this.languageService = ts.createLanguageService(languageServiceHost);
    }

    getCompilerLanguageService() {
        return this.languageService;
    }

    /**
     * Gets the language service's program.
     */
    getProgram() {
        return new TsProgram(this.getSourceFiles().map(s => s.getFileName()), this.compilerOptions, this.compilerHost);
    }

    // todo: mark internal
    setCompilerFactory(compilerFactory: CompilerFactory) {
        if (this.compilerFactory != null)
            throw new Error("Cannot set compiler factory more than once.");

        this.compilerFactory = compilerFactory;
    }

    renameNode(node: Node<ts.Node>, newName: string) {
        const renameReplaces = this.findRenameReplaces(node);
        for (let renameReplace of renameReplaces) {
            let difference = 0;
            for (let textSpan of renameReplace.textSpans) {
                textSpan.start -= difference;
                renameReplace.sourceFile.replaceText(textSpan.start, textSpan.start + textSpan.length, newName);
                difference += textSpan.length - newName.length;
            }
        }
    }

    findRenameReplaces(node: Node<ts.Node>): SourceFileReplace[] {
        const sourceFile = node.getSourceFile();
        if (sourceFile == null)
            throw new Error("Node has no sourcefile");

        const textSpansBySourceFile = new KeyValueCache<SourceFile, TextSpan[]>();
        const renameLocations = this.languageService.findRenameLocations(sourceFile.getFileName(), node.getStart(), false, false) || [];
        renameLocations.forEach(l => {
            const sourceFile = this.compilerFactory.getSourceFileFromFilePath(l.fileName)!;
            const textSpans = textSpansBySourceFile.getOrCreate<TextSpan[]>(sourceFile, () => []);
            // todo: ensure this is sorted
            textSpans.push({
                start: l.textSpan.start,
                length: l.textSpan.length
            });
        });

        const replaces: SourceFileReplace[] = [];

        for (let entry of textSpansBySourceFile.getEntries()) {
            replaces.push({
                sourceFile: entry[0],
                textSpans: entry[1]
            });
        }

        return replaces;
    }

    addSourceFile(sourceFile: SourceFile) {
        this.sourceFiles.push(sourceFile);
    }

    getScriptTarget() {
        return this.compilerOptions.target!;
    }

    getNewLine() {
        switch (this.compilerOptions.newLine) {
            case undefined:
            case ts.NewLineKind.LineFeed:
                return "\n";
            case ts.NewLineKind.CarriageReturnLineFeed:
                return "\r\n";
            default:
                throw new Error("Not implemented new line kind.");
        }
    }

    getSourceFiles() {
        return this.sourceFiles;
    }
}

﻿import {expect} from "chai";
import {CompilerOptionsResolver, FileUtils} from "./../../utils";
import * as errors from "./../../errors";
import * as testHelpers from "./../testHelpers";

describe(nameof(CompilerOptionsResolver), () => {
    describe(nameof<CompilerOptionsResolver>(r => r.getCompilerOptions), () => {
        describe("no constructor", () => {
            it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host);
                const compilerOptions = resolver.getCompilerOptions({});

                expect(compilerOptions).to.deep.equal(getDefaultCompilerOptions());
            });

            it(`should get the compiler options from tsconfig when not providing anything and a tsconfig exists`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
                const resolver = new CompilerOptionsResolver(host);
                const compilerOptions = resolver.getCompilerOptions({});
                expect(compilerOptions).to.deep.equal({ rootDir: FileUtils.getStandardizedAbsolutePath("test"), target: 1 });
            });
        });

        describe("compiler options", () => {
            it(`should get empty compiler options when providing an empty compiler options object`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host);
                const compilerOptions = resolver.getCompilerOptions({
                    compilerOptions: {}
                });

                expect(compilerOptions).to.deep.equal({});
            });

            it(`should use compiler options when providing a tsconfig path`, () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host);
                const compilerOptions = resolver.getCompilerOptions({
                    tsConfigFilePath: "test.txt",
                    compilerOptions: {
                        rootDir: "test",
                        target: 1
                    }
                });

                expect(compilerOptions).to.deep.equal({ rootDir: "test", target: 1 });
            });
        });

        describe("tsconfig", () => {
            it("should throw an error when the path doesn't exist", () => {
                const host = testHelpers.getFileSystemHostWithFiles([]);
                const resolver = new CompilerOptionsResolver(host);
                expect(() => resolver.getCompilerOptions({ tsConfigFilePath: "tsconfig.json" }))
                    .to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("tsconfig.json")}`);
            });

            it("should throw an error when the file doesn't parse", () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: "*&($%0583$#@%" }]);
                const resolver = new CompilerOptionsResolver(host);
                expect(() => resolver.getCompilerOptions({ tsConfigFilePath: "tsconfig.json" })).to.throw(Error);
            });

            it("should get the compiler options plus the defaults when providing some", () => {
                const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
                const resolver = new CompilerOptionsResolver(host);
                const compilerOptions = resolver.getCompilerOptions({ tsConfigFilePath: "tsconfig.json" });
                expect(compilerOptions).to.deep.equal({ rootDir: "test", target: 1 });
            });
        });
    });
});

function getDefaultCompilerOptions() {
    return {
        allowJs: true,
        experimentalDecorators: true,
        moduleResolution: 2,
        noImplicitAny: false,
        noLib: false,
        strictNullChecks: false,
        suppressExcessPropertyErrors: true,
        suppressImplicitAnyIndexErrors: true,
        target: 5,
        types: []
    };
}
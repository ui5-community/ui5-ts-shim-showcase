# UI5 Showcase Project Shims For TypeScript

This project demonstrates how to use project shims for external libraries, use them at runtime in UI5 applications and to benefit from the TypeScript support for code completion.

In order to use OSS libraries from NPM packages at development time with code completion and finally at runtime you need to understand two concepts:

* [UI5 Tooling Project Shims](https://sap.github.io/ui5-tooling/pages/extensibility/ProjectShims/)
* [UI5 Module Loader Shims](https://openui5.hana.ondemand.com/#/api/sap.ui.loader/methods/sap.ui.loader.config)

With the UI5 Tooling you can include any OSS library available as NPM package which includes their prebuild JavaScript bundles. The Project Shim ensures to access the resources of the NPM package via a predefined path.

After the OSS library can be accessed you need to configure the UI5 Module Loader to understand the OSS library. E.g. in case of an AMD module you need to configure the module loader to access the export of the OSS library.

Another important challenge is the combination with TypeScript. As you want to use the type definitions as provided by the library or by [DefinitelyTyped](https://definitelytyped.org/), the import path of the OSS library must match to the expected path of the OSS library:

```js
 // TypeScript code completion doesn't work!
import { reverse } from "showcase/shim/thirdparty/lodash";

// TypeScript code completion works!
import { reverse } from "lodash";
```

To allow loading the thirdparty modules from the expected path you can use the mapping functionality of the UI5 Module Loader. Now the code completion for the OSS library will work out of the box with TypeScript.

## How-To Use OSS Libraries

The following steps will explain how you can use OSS libraries in a *standalone* UI5 applications. The solution is not possible for *non-standalone* scenarios as you are most probably not allowed to configure the loader there.

For the showcase we are including `lodash` as a OSS library into the UI5 application.

### Preparation

The project has been created using the [easy-ui5](https://github.com/SAP/generator-easy-ui5) generator by using the [generator-ui5-ts-app](https://github.com/ui5-community/generator-ui5-ts-app).

```sh
> ~ % yo easy-ui5 ts-app

     _-----_     
    |       |    ╭──────────────────────────╮
    |--(o)--|    │  Welcome to the easy-ui5 │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |     
   __'.___.'__   
 ´   `  |° ´ Y ` 

? How do you want to name this application? myapp
? Which namespace do you want to use? com.myorg
? Which framework do you want to use? OpenUI5
? Which framework version do you want to use? 1.94.0
? Who is the author of the library? Peter Muessig
? Would you like to create a new directory for the application? (Y/n) Y
```

### Step 1: Install the depencencies

Run the following commands to install `lodash` and the type definitions for `lodash` from DefinitelyTyped:

```sh
npm i lodash -D

npm i @types/lodash -D
```

### Step 2: Add lodash as a dependency to recognize to the UI5 Tooling

In order to improve the lookup for dependencies of the project by the UI5 Tooling we configure the UI5 dependencies in the section `ui5 > depndencies` in the `package.json`:

```json
{
  ...
  "ui5": {
    "dependencies": [
      "lodash",
      ...
    ]
  }
  ...
}
```

The UI5 dependencies are an array of the dependency names as used in the standard dependencies section.

### Step 3: Configure the Project Shim

In the `ui5.yaml` we need to add an additional section which contains the shim information for `lodash`:

```yaml
# Read more about project shims here: https://sap.github.io/ui5-tooling/pages/extensibility/ProjectShims/
---
specVersion: "2.5"
kind: extension
type: project-shim
metadata:
  name: ui5-ts-shim-showcase.thirdparty
shims:
  configurations:
    lodash: # dependency name as defined in package.json
      specVersion: "2.5"
      type: module # module type
      metadata:
        name: lodash
      resources:
        configuration:
          paths:
            "/thirdparty/lodash/": "" # map root directory of lodash module into projects' thirdparty namespace
```

This section ensures that the `lodash` resources of the NPM package are available via the following URL relative to the application resources: [`http://localhost:8080/thirdparty/lodash`](http://localhost:8080/thirdparty/lodash).

### Step 4: Configure the UI5 Module Loader

The UI5 Module Loader needs to know how to handle the modules of the OSS library. Therefore we need to add a shim configuration for the loader. First, you need to specify the module namespace. As we mapped `lodash` relative to our application namespace we need to concat them: `ui5-ts-shim-showcase` + `thirdparty/lodash` + `lodash` (project namespace + shim namespace + module name). `lodash` is using the UMD boilerplate which means that it exports globally, if no AMD loader is present. For the UI5 AMD-like Module Loader the AMD loading needs to be suppressed so that the export happens globally. In addition, you need to specify to which global variable the module exports to, in case of `lodash` this is `_`. As `lodash` has no dependencies (`deps`) we just keep an empty array but you can even omit it.

```js
sap.ui.loader.config({
    shim: {
        "ui5-ts-shim-showcase/thirdparty/lodash/lodash": {
            "amd": true,
            "deps": [],
            "exports": "_"
        }
    }
});
```

For using the types from DefinitelyTyped, we now need to map `lodash` from our namespace to the default namespace. The following configuration of the UI5 Module Loader will do that trick for us:

```js
sap.ui.loader.config({
    map: {
        "*": {
            "lodash": "ui5-ts-shim-showcase/thirdparty/lodash/lodash"
        }
    },
    shim: { ... }
});
```

### Step 5: Using the OSS Library and Benefit from Code Completion

Now it's time to use `lodash` in your UI5 application. Just import lodash functions from the lodash module as follows and you will get proper support

```js
import { reverse } from "lodash";

reverse("Hello World!".split("")).join(""));
```

### Wrap up

That's it. Enjoy...

### Remarks

For the namespace of the project, we used `ui5-ts-shim-showcase`. A namespace with dashes works but has some downsides while accessing the resources from the global namespace.

## How to obtain support

Please use the GitHub bug tracking system to post questions, bug reports or to create pull requests.

## Contributing

Any type of contribution (code contributions, pull requests, issues) to this showcase will be equally appreciated.

## License

This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.

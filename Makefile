# stereovideo.js Makefile

# Configuration
# Node modules and associated utilities.
NPM_BIN=$(shell pwd)/node_modules/.bin
jsdoc=$(NPM_BIN)/jsdoc
tsc=$(NPM_BIN)/tsc
tslint=$(NPM_BIN)/tslint
uglifyjs=$(NPM_BIN)/uglifyjs

# Source Files
SRC_ICONS=$(shell find ./resources/images -type f -name '*.svg')
SRC_SHADERS=$(shell find ./resources/shaders -type f -name '*.frag' -or -name '*.vert')
SRC_STYLE=$(shell find ./resources/styles -type f -name '*.scss')
SRC_STYLE_ROOT=./resources/styles/stereovideo.scss
SRC_TYPESCRIPT=$(shell find ./src -type f -name '*.ts')

# Output Directories
DOCS_DIR=$(shell pwd)/docs
BUILD_DIR=$(shell pwd)/build
DIST_DIR=$(shell pwd)/dist

APP_JS=$(BUILD_DIR)/js/stereovideo.js
APP_JS_MIN=$(DIST_DIR)/js/stereovideo.min.js
APP_SHADERS=$(BUILD_DIR)/js/shader.inc.ts
APP_STYLE=$(DIST_DIR)/css/stereovideo.css
APP_STYLE_ICONS=$(BUILD_DIR)/css/_icons.scss

all: compile-typescript uglify-javascript css

# Automatically setup all Node dependencies by calling 'npm install'.
setup: $(NPM_BIN)
$(NPM_BIN):
	npm install

# Combine all of the shaders into a single TypeScript file for compilation.
shaders: $(APP_SHADERS)
$(APP_SHADERS): $(SRC_SHADERS)
	@echo '-- bundling shader source files'
	@mkdir -p $(dir $@)
	@node ./scripts/compact-shaders.js $^ > $(APP_SHADERS)

# Combine all of the application icons into a single CSS file as data-uri's.
icons: $(APP_STYLE_ICONS)
$(APP_STYLE_ICONS): $(SRC_ICONS)
	@echo '-- bundling application icons'
	@mkdir -p $(dir $@)
	@node ./scripts/encode-icons.js $^ > $(APP_STYLE_ICONS)

# Process CSS to produce final browser-ready output.
css: $(APP_STYLE)
$(APP_STYLE): $(SRC_STYLE) $(APP_STYLE_ICONS)
	@echo '-- compiling CSS files from SCSS source'
	@mkdir -p $(dir $@)
	@node ./scripts/compile-css.js $(SRC_STYLE_ROOT) $@ ./resources/styles ./build/css

# Apply TSLint to the TypeScript source.  The configuraiton is stored in
# tslint.json.
lint: $(SRC_TYPESCRIPT)
	@echo '-- linting typescript source'
	@$(tslint) $^

# Compile the TypeScript source into a single JS file.
$(APP_JS): $(SRC_TYPESCRIPT) $(APP_SHADERS)
	@echo '-- compiling typescript source'
	@mkdir -p $(dir $@)
	@$(tsc) --pretty --inlineSourceMap --noEmitOnError --target es5 --outFile $@ $^

$(APP_JS_MIN): $(APP_JS)
	@echo '-- minifying javascript "'$(notdir $<)'" -> "'$(notdir $@)'"'
	@mkdir -p $(dir $@)
	@$(uglifyjs) $^ -cmo $@

compile-typescript: $(APP_JS)
uglify-javascript: $(APP_JS_MIN)

# Generate the API documentation.  This process involves first compiling to
# ECMAScript 2015 and then running JSDoc on that.  It's not optimal but it
# works (mostly).
$(BUILD_DIR)/tmp/es2015: $(SRC_TYPESCRIPT)
	@mkdir -p $(BUILD_DIR)/tmp
	@echo '-- compiling typescript to ECMAScript 2015'
	@$(tsc) --target es2015 --outDir $(BUILD_DIR)/tmp/es2015 $^

doc: $(BUILD_DIR)/tmp/es2015
	@echo '-- building documentation'
	@$(jsdoc) -c jsdoc.json -d $(DOCS_DIR) $(BUILD_DIR)/tmp/es2015 README.md

# Clean up all build products.
clean: clean-build clean-docs clean-dist

clean-build:
	@echo '-- removing $(BUILD_DIR)'
	@rm -rf $(BUILD_DIR)

clean-docs:
	@echo '-- removing $(DOCS_DIR)'
	@rm -rf $(DOCS_DIR)

clean-dist:
	@echo '-- removing $(DIST_DIR)'
	@rm -rf $(DIST_DIR)

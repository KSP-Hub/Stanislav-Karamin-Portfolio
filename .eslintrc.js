/**
 * ESLint configuration for Stanislav Karamin Portfolio
 * Конфигурация линтера для проверки качества кода
 */

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    globals: {
        // Global variables
        'ym': 'readonly',
        'gtag': 'readonly',
        'dataLayer': 'readonly',
        'CONFIG': 'readonly'
    },
    rules: {
        // Error Prevention
        'no-console': ['warn', { 
            allow: ['warn', 'error', 'info'] 
        }],
        'no-unused-vars': ['warn', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        'no-undef': 'error',
        'no-unreachable': 'error',
        
        // Best Practices
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'no-sequences': 'error',
        'no-throw-literal': 'error',
        'no-useless-call': 'error',
        'no-useless-concat': 'error',
        'no-useless-return': 'error',
        'radix': 'error',
        'wrap-iife': ['error', 'any'],
        
        // Style
        'indent': ['warn', 4, { 
            SwitchCase: 1,
            VariableDeclarator: 1
        }],
        'quotes': ['warn', 'single', { 
            avoidEscape: true,
            allowTemplateLiterals: true
        }],
        'semi': ['warn', 'always'],
        'comma-dangle': ['warn', 'never'],
        'no-trailing-spaces': 'warn',
        'eol-last': ['warn', 'always'],
        'no-multiple-empty-lines': ['warn', { 
            max: 2,
            maxEOF: 1
        }],
        'space-before-function-paren': ['warn', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
        }],
        'keyword-spacing': ['warn', {
            before: true,
            after: true
        }],
        'space-before-blocks': 'warn',
        'space-infix-ops': 'warn',
        'object-curly-spacing': ['warn', 'always'],
        'array-bracket-spacing': ['warn', 'never'],
        'comma-spacing': ['warn', {
            before: false,
            after: true
        }],
        
        // ES6+
        'arrow-spacing': ['warn', {
            before: true,
            after: true
        }],
        'no-var': 'warn',
        'prefer-const': 'warn',
        'prefer-arrow-callback': 'warn',
        'prefer-template': 'warn',
        'template-curly-spacing': ['warn', 'never'],
        'object-shorthand': 'warn',
        'prefer-destructuring': ['warn', {
            array: false,
            object: true
        }],
        
        // JSDoc (optional, requires plugin)
        // 'require-jsdoc': 'off',
        // 'valid-jsdoc': 'off',
        
        // Accessibility (optional, requires plugin)
        // 'jsx-a11y/alt-text': 'error',
        
        // Disable some rules that are too strict for this project
        'no-magic-numbers': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'complexity': 'off',
        'max-depth': 'off',
        'max-params': 'off'
    },
    overrides: [
        {
            // Config files
            files: ['*.config.js', '*.config.mjs', '.eslintrc.js'],
            env: {
                node: true
            }
        },
        {
            // Test files
            files: ['**/*.test.js', '**/*.spec.js'],
            env: {
                jest: true,
                mocha: true
            }
        }
    ]
};


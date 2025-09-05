// filepath: /home/onault/Desktop/github/redtetris/client/jest.config.js
export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'jsx'],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
        '.+\\.(css|styl|less|sass|scss)$': 'jest-css-modules-transform',
    },
    moduleNameMapper: {
        '^/src/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testTimeout: 10000,
    maxWorkers: 1,
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
};
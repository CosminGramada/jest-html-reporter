/* eslint-disable global-require */
const fs = require('fs');
const mockdata = require('./mockdata');
const config = require('../src/config');

const pathToConfig = '../src/config';
// Mock the static config methods by extending the default config
const mockedConfigFunctions = { ...config };
mockedConfigFunctions.setup = jest.fn();
mockedConfigFunctions.getLogo = jest.fn();

describe('index', () => {
	beforeEach(() => {
		// Reset the mocked modules prior to each test case
		jest.resetModules();
		// Remove report generated by last run
		if (fs.existsSync(mockedConfigFunctions.getOutputFilepath())) {
			fs.unlinkSync(mockedConfigFunctions.getOutputFilepath());
		}
	});

	// change test order, to aviod failure when the next test start before the previous report
	// has been finished written to disk
	it('should return the jest test data if used with Jest reporters configuration', async () => {
		// Mocked config
		mockedConfigFunctions.getExecutionMode = () => 'reporter';
		jest.mock(pathToConfig, () => (mockedConfigFunctions));
		// The plugin needs to be required after we have mocked the config
		const JestHTMLReporter = require('../src');

		// When run as a Jest reporter, the plugin will be instantiated as a class
		const ReporterInitiatedByJest = new JestHTMLReporter();
		// Mock the end of a test run
		await ReporterInitiatedByJest.onRunComplete(null, mockdata.jestResponse.singleTestResult);
		expect(fs.existsSync(mockedConfigFunctions.getOutputFilepath()))
			.toEqual(true);
	});

	it('should return the jest test data if used with Jest testResultsProcessor configuration', () => {
		// Mocked config
		mockedConfigFunctions.getExecutionMode = () => 'testResultsProcessor';
		jest.mock(pathToConfig, () => (mockedConfigFunctions));
		// The plugin needs to be required after we have mocked the config
		const JestHTMLReporter = require('../src');

		// Trigger the reporter as a testResultsProcessor
		const testResultsProcessorOutput = JestHTMLReporter(mockdata.jestResponse.singleTestResult);
		expect(testResultsProcessorOutput)
			.toEqual(mockdata.jestResponse.singleTestResult);
	});
});

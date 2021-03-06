/**
 * @fileoverview Folders Manager Tests
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
var assert = require('chai').assert,
	sinon = require('sinon'),
	mockery = require('mockery'),
	leche = require('leche');

var BoxClient = require('../../../lib/box-client');


// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------
var sandbox = sinon.sandbox.create(),
	boxClientFake = leche.fake(BoxClient.prototype),
	Folders,
	folders,
	testQS = { testQSKey: 'testQSValue' },
	testBody = { my: 'body' },
	testParamsWithBody,
	testParamsWithQs,
	FOLDER_ID = '1234',
	MODULE_FILE_PATH = '../../../lib/managers/folders';


// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

describe('Folders', function() {

	before(function() {
		// Enable Mockery
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false
		});
		// Register Mocks
		mockery.registerAllowable(MODULE_FILE_PATH);
	});

	beforeEach(function() {
		testParamsWithBody = {body: testBody};
		testParamsWithQs = {qs: testQS};
		// Setup File Under Test
		Folders = require(MODULE_FILE_PATH);
		folders = new Folders(boxClientFake);
	});

	afterEach(function() {
		sandbox.verifyAndRestore();
		mockery.resetCache();
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('get()', function() {
		it('should make GET request to get folder info when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/1234', testParamsWithQs);
			folders.get(FOLDER_ID, testQS);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/1234', testParamsWithQs).yieldsAsync();
			folders.get(FOLDER_ID, testQS, done);
		});
	});

	describe('getItems()', function() {
		it('should make GET request to get folder items when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/1234/items', testParamsWithQs);
			folders.getItems(FOLDER_ID, testQS);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/1234/items', testParamsWithQs).yieldsAsync();
			folders.getItems(FOLDER_ID, testQS, done);
		});
	});

	describe('getCollaborations()', function() {
		it('should make GET request to get folder collaborations when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/1234/collaborations', testParamsWithQs);
			folders.getCollaborations(FOLDER_ID, testQS);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/1234/collaborations', testParamsWithQs).yieldsAsync();
			folders.getCollaborations(FOLDER_ID, testQS, done);
		});
	});

	describe('create()', function() {

		var PARENT_FOLDER_ID = '2345',
			NEW_FOLDER_NAME = 'some new folder name',
			expectedParams = {
				body: {
					parent: {
						id: PARENT_FOLDER_ID
					},
					name: NEW_FOLDER_NAME
				}
			};

		it('should make POST request to create a new folder when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders', expectedParams);
			folders.create(PARENT_FOLDER_ID, NEW_FOLDER_NAME);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'post').withArgs('/folders').yieldsAsync();
			folders.create(PARENT_FOLDER_ID, NEW_FOLDER_NAME, done);
		});
	});

	describe('copy()', function() {

		var NEW_PARENT_ID = '23434qtges4TEST',
			expectedParams = {
				body: {
					parent: {
						id: NEW_PARENT_ID
					}
				}
			};

		it('should make POST request to copy the folder when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/1234/copy', expectedParams);
			folders.copy(FOLDER_ID, NEW_PARENT_ID);
		});

		it('should make POST request to copy the folder with optional parameters when passed', function() {

			var name = 'rename on copy';

			expectedParams.body.name = name;

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/1234/copy', expectedParams);
			folders.copy(FOLDER_ID, NEW_PARENT_ID, {name});
		});

		it('should call the defaultResponseHandler wrapped callback when response is returned', function(done) {
			var callbackMock = sandbox.mock().never();
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withExactArgs(callbackMock).returns(done);
			sandbox.stub(boxClientFake, 'post').withArgs('/folders/1234/copy').yieldsAsync();
			folders.copy(FOLDER_ID, NEW_PARENT_ID, callbackMock);
		});

	});

	describe('update()', function() {
		it('should make PUT request to update folder info when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('put').withArgs('/folders/1234', testParamsWithBody);
			folders.update(FOLDER_ID, testBody);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'put').withArgs('/folders/1234', testParamsWithBody).yieldsAsync();
			folders.update(FOLDER_ID, testBody, done);
		});
	});

	describe('addToCollection()', function() {

		var COLLECTION_ID = '9873473596';

		it('should get current collections and add new collection when item has no collections', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: []
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: COLLECTION_ID}]}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.addToCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should get current collections and add new collection when item has other collections', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: '111'}]
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: '111'},{id: COLLECTION_ID}]}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.addToCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should get current collections and pass same collections when item is already in the collection', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: COLLECTION_ID},{id: '111'}]
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: COLLECTION_ID},{id: '111'}]}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.addToCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should call callback with error when getting current collections fails', function(done) {

			var error = new Error('Failed get');

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(error);
			foldersMock.expects('update').never();
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.addToCollection(FOLDER_ID, COLLECTION_ID, function(err) {

				assert.equal(err, error);
				done();
			});
		});

		it('should call callback with error when adding the collection fails', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: COLLECTION_ID},{id: '111'}]
			};

			var error = new Error('Failed update');

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: COLLECTION_ID},{id: '111'}]}).yieldsAsync(error);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.addToCollection(FOLDER_ID, COLLECTION_ID, function(err) {

				assert.equal(err, error);
				done();
			});
		});
	});

	describe('removeFromCollection()', function() {

		var COLLECTION_ID = '98763';

		it('should get current collections and pass empty array when item is not in any collections', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: []
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: []}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should get current collections and pass empty array when item is in the collection to be removed', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: COLLECTION_ID}]
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: []}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should get current collections and pass filtered array when item is in multiple collections', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: COLLECTION_ID},{id: '111'}]
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: '111'}]}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should get current collections and pass same array when item is in only other collections', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: '111'},{id: '222'}]
			};

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: '111'},{id: '222'}]}).yieldsAsync(null, folder);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, done);
		});

		it('should call callback with error when getting current collections fails', function(done) {

			var error = new Error('Failed get');

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(error);
			foldersMock.expects('update').never();
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, function(err) {

				assert.equal(err, error);
				done();
			});
		});

		it('should call callback with error when adding the collection fails', function(done) {

			var folder = {
				id: FOLDER_ID,
				collections: [{id: COLLECTION_ID},{id: '111'}]
			};

			var error = new Error('Failed update');

			var foldersMock = sandbox.mock(folders);
			foldersMock.expects('get').withArgs(FOLDER_ID, {fields: 'collections'}).yieldsAsync(null, folder);
			foldersMock.expects('update').withArgs(FOLDER_ID, {collections: [{id: '111'}]}).yieldsAsync(error);
			sandbox.stub(boxClientFake, 'defaultResponseHandler').returnsArg(0);

			folders.removeFromCollection(FOLDER_ID, COLLECTION_ID, function(err) {

				assert.equal(err, error);
				done();
			});
		});
	});

	describe('move()', function() {

		var NEW_PARENT_ID = '32592395test',
			expectedParams = {
				body: {
					parent: {
						id: NEW_PARENT_ID
					}
				}
			};

		it('should make PUT request to update the folder parent ID when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('put').withArgs('/folders/1234', expectedParams);
			folders.move(FOLDER_ID, NEW_PARENT_ID);
		});

		it('should call the defaultResponseHandler wrapped callback when response is returned', function(done) {
			var callbackMock = sandbox.mock().never();
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withExactArgs(callbackMock).returns(done);
			sandbox.stub(boxClientFake, 'put').withArgs('/folders/1234').yieldsAsync();
			folders.move(FOLDER_ID, testBody, callbackMock);
		});

	});

	describe('delete()', function() {
		it('should make DELETE request to update folder info when called', function() {
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('del').withArgs('/folders/1234', testParamsWithQs);
			folders.delete(FOLDER_ID, testQS);
		});
		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {
			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'del').withArgs('/folders/1234', testParamsWithQs).yieldsAsync();
			folders.delete(FOLDER_ID, testQS, done);
		});
	});

	describe('getAllMetadata()', function() {

		it('should make GET call to fetch metadata', function(done) {

			sandbox.stub(boxClientFake, 'defaultResponseHandler').yields();
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/1234/metadata', null);
			folders.getAllMetadata(FOLDER_ID, done);
		});
	});

	describe('getMetadata()', function() {

		it('should make GET call to fetch metadata', function(done) {

			sandbox.stub(boxClientFake, 'defaultResponseHandler').yields();
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/1234/metadata/global/properties', null);
			folders.getMetadata(FOLDER_ID, 'global', 'properties', done);
		});
	});

	describe('addMetadata()', function() {

		it('should make POST call to add metadata', function(done) {

			var metadata = {
				foo: 'bar'
			};

			var expectedParams = {
				body: metadata
			};

			sandbox.stub(boxClientFake, 'defaultResponseHandler').yields();
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/1234/metadata/global/properties', expectedParams);
			folders.addMetadata(FOLDER_ID, 'global', 'properties', metadata, done);
		});
	});

	describe('updateMetadata()', function() {

		it('should make PUT call with JSON Patch to update metadata', function(done) {

			var patch = [{
				op: 'add',
				path: '/foo',
				value: 'bar'
			}];

			var expectedParams = {
				body: patch,
				headers: {
					'Content-Type': 'application/json-patch+json'
				}
			};

			sandbox.stub(boxClientFake, 'defaultResponseHandler').yields();
			sandbox.mock(boxClientFake).expects('put').withArgs('/folders/1234/metadata/global/properties', expectedParams);
			folders.updateMetadata(FOLDER_ID, 'global', 'properties', patch, done);
		});
	});

	describe('deleteMetadata()', function() {

		it('should make DELETE call to remove metadata', function(done) {

			sandbox.stub(boxClientFake, 'defaultResponseHandler').yields();
			sandbox.mock(boxClientFake).expects('del').withArgs('/folders/1234/metadata/global/properties', null);
			folders.deleteMetadata(FOLDER_ID, 'global', 'properties', done);
		});
	});

	describe('getTrashedFolder()', function() {
		it('should make GET request to get trashed folder when called', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/' + FOLDER_ID + '/trash', testParamsWithQs);
			folders.getTrashedFolder(FOLDER_ID, testQS);
		});

		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {

			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/' + FOLDER_ID + '/trash', testParamsWithQs).yieldsAsync();
			folders.getTrashedFolder(FOLDER_ID, testQS, done);
		});
	});

	describe('restoreFromTrash()', function() {

		var NAME = 'Folder Restored',
			PARENT_ID = '0',
			parent,
			expectedParams;

		beforeEach(function() {

			parent = {
				id: PARENT_ID
			};
			expectedParams = {body: {}};
		});

		it('should make POST request with all parameters to restore a folder when all optional parameters are passed', function() {

			var options = {
				name: NAME,
				parent_id: PARENT_ID
			};

			expectedParams.body = {
				name: NAME,
				parent: parent
			};
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/' + FOLDER_ID, expectedParams);
			folders.restoreFromTrash(FOLDER_ID, options);
		});

		it('should make POST request with a name to restore a folder when just a name is passed', function() {

			var options = {name: NAME};

			expectedParams.body.name = NAME;
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/' + FOLDER_ID, expectedParams);
			folders.restoreFromTrash(FOLDER_ID, options);
		});

		it('should make POST request with a parentFolderId to restore a folder when just parent_id is passed', function() {

			var options = {
				parent_id: PARENT_ID
			};

			expectedParams.body.parent = parent;
			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/' + FOLDER_ID, expectedParams);
			folders.restoreFromTrash(FOLDER_ID, options);
		});

		it('should make POST request with an empty body to restore a folder when neither optional parameter is passed', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('post').withArgs('/folders/' + FOLDER_ID, {body: {}});
			folders.restoreFromTrash(FOLDER_ID, null);
		});


		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {

			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'post').yieldsAsync();
			folders.restoreFromTrash(FOLDER_ID, null, done);
		});
	});

	describe('deletePermanently()', function() {

		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {

			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'del').withArgs('/folders/' + FOLDER_ID + '/trash').yieldsAsync();
			folders.deletePermanently(FOLDER_ID, done);
		});

		it('should make DELETE call to remove folder permanently', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('del').withArgs('/folders/' + FOLDER_ID + '/trash', null);
			folders.deletePermanently(FOLDER_ID);
		});

	});

	describe('getWatermark()', function() {

		it('should make GET request to get folder watermark info when called', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('get').withArgs('/folders/' + FOLDER_ID + '/watermark', testParamsWithQs);
			folders.getWatermark(FOLDER_ID, testQS);
		});

		it('should call callback with error when API call returns error', function(done) {

			var apiError = new Error('failed');
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/' + FOLDER_ID + '/watermark').yieldsAsync(apiError);
			folders.getWatermark(FOLDER_ID, null, function(err) {

				assert.equal(err, apiError);
				done();
			});
		});

		it('should call callback with error when API call returns non-200 status code', function(done) {

			var res = {statusCode: 404};
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/' + FOLDER_ID + '/watermark').yieldsAsync(null, res);
			folders.getWatermark(FOLDER_ID, null, function(err) {

				assert.instanceOf(err, Error);
				done();
			});
		});

		it('should call callback with watermark data when API call succeeds', function(done) {

			var watermark = {
				created_at: '2016-01-01T12:55:34-08:00',
				modified_at: '2016-01-01T12:55:34-08:00'
			};

			var res = {
				statusCode: 200,
				body: {watermark}
			};
			sandbox.stub(boxClientFake, 'get').withArgs('/folders/' + FOLDER_ID + '/watermark').yieldsAsync(null, res);
			folders.getWatermark(FOLDER_ID, null, function(err, data) {

				assert.isNull(err, 'Error should be absent');
				assert.equal(data, watermark);
				done();
			});
		});

	});

	describe('applyWatermark()', function() {
		var expectedParams;

		beforeEach(function() {
			expectedParams = {
				body: {
					watermark: {
						imprint: 'default'
					}
				}
			};
		});

		it('should make PUT request to apply watermark on a folder', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('put').withArgs('/folders/' + FOLDER_ID + '/watermark', expectedParams);
			folders.applyWatermark(FOLDER_ID, null);
		});

		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {

			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'put').withArgs('/folders/' + FOLDER_ID + '/watermark').yieldsAsync();
			folders.applyWatermark(FOLDER_ID, null, done);
		});
	});

	describe('removeWatermark()', function() {

		it('should make DELETE call to remove watermark', function() {

			sandbox.stub(boxClientFake, 'defaultResponseHandler');
			sandbox.mock(boxClientFake).expects('del').withArgs('/folders/' + FOLDER_ID + '/watermark', null);
			folders.removeWatermark(FOLDER_ID);
		});

		it('should call BoxClient defaultResponseHandler method with the callback when response is returned', function(done) {

			sandbox.mock(boxClientFake).expects('defaultResponseHandler').withArgs(done).returns(done);
			sandbox.stub(boxClientFake, 'del').withArgs('/folders/' + FOLDER_ID + '/watermark').yieldsAsync();
			folders.removeWatermark(FOLDER_ID, done);
		});

	});

});
